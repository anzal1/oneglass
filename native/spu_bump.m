#import <Foundation/Foundation.h>
#import <IOKit/IOKitLib.h>
#import <IOKit/hid/IOHIDManager.h>
#import <ApplicationServices/ApplicationServices.h>
#include <math.h>
#include <sys/time.h>

static double prev_ax = 0.0, prev_ay = 0.0, prev_az = 0.0;
static int has_prev = 0;
static double ema_noise = 0.0016;
static double window_peak_jerk = 0.0;
static long long last_bump_ms = 0;
static long long last_telem_ms = 0;
static int sample_count = 0;

static long long now_ms(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (long long)tv.tv_sec * 1000LL + (long long)(tv.tv_usec / 1000);
}

static int is_user_typing_or_clicking(void) {
    CFTimeInterval kd = CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateCombinedSessionState, kCGEventKeyDown);
    CFTimeInterval ku = CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateCombinedSessionState, kCGEventKeyUp);
    CFTimeInterval fc = CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateCombinedSessionState, kCGEventFlagsChanged);
    CFTimeInterval md = CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateCombinedSessionState, kCGEventLeftMouseDown);
    CFTimeInterval mu = CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateCombinedSessionState, kCGEventLeftMouseUp);
    if (kd < 0.55 || ku < 0.55 || fc < 0.45 || md < 0.35 || mu < 0.35) {
        return 1;
    }
    return 0;
}

static void wake_spu_drivers(void) {
    CFMutableDictionaryRef matching = IOServiceMatching("AppleSPUHIDDriver");
    io_iterator_t iter = 0;
    if (IOServiceGetMatchingServices(kIOMainPortDefault, matching, &iter) == KERN_SUCCESS) {
        io_service_t svc;
        while ((svc = IOIteratorNext(iter)) != 0) {
            int one = 1;
            int interval = 5000;
            CFNumberRef nOne = CFNumberCreate(kCFAllocatorDefault, kCFNumberIntType, &one);
            CFNumberRef nInt = CFNumberCreate(kCFAllocatorDefault, kCFNumberIntType, &interval);
            IORegistryEntrySetCFProperty(svc, CFSTR("SensorPropertyReportingState"), nOne);
            IORegistryEntrySetCFProperty(svc, CFSTR("SensorPropertyPowerState"), nOne);
            IORegistryEntrySetCFProperty(svc, CFSTR("ReportInterval"), nInt);
            CFRelease(nOne);
            CFRelease(nInt);
            IOObjectRelease(svc);
        }
        IOObjectRelease(iter);
    }
}

static void accel_report_cb(void *context, IOReturn result, void *sender,
                            IOHIDReportType type, uint32_t reportID,
                            uint8_t *report, CFIndex reportLength) {
    if (reportLength < 18) return;
    int32_t raw_x = 0, raw_y = 0, raw_z = 0;
    memcpy(&raw_x, report + 6, 4);
    memcpy(&raw_y, report + 10, 4);
    memcpy(&raw_z, report + 14, 4);
    double ax = (double)raw_x / 65536.0;
    double ay = (double)raw_y / 65536.0;
    double az = (double)raw_z / 65536.0;

    if (!has_prev) {
        prev_ax = ax; prev_ay = ay; prev_az = az;
        has_prev = 1;
        return;
    }

    double dx = ax - prev_ax;
    double dy = ay - prev_ay;
    double dz = az - prev_az;
    prev_ax = ax; prev_ay = ay; prev_az = az;

    double jerk = sqrt(dx * dx + dy * dy + dz * dz);
    double xy_jerk = sqrt(dx * dx + dy * dy);
    if (jerk > window_peak_jerk) window_peak_jerk = jerk;
    sample_count++;

    long long t = now_ms();
    int typing = is_user_typing_or_clicking();

    double thresh = fmax(0.026, fmin(0.055, ema_noise * 12.0));

    if (!typing && sample_count > 40 && jerk > thresh && xy_jerk > 0.0095 && (t - last_bump_ms) > 650) {
        last_bump_ms = t;
        fprintf(stdout, "{\"type\":\"hw_bump\",\"jerk\":%.5f,\"xy_jerk\":%.5f,\"thresh\":%.5f,\"ts\":%lld}\n",
                jerk, xy_jerk, thresh, t);
        fflush(stdout);
    } else if (!typing && jerk < thresh * 0.5) {
        ema_noise = ema_noise * 0.985 + jerk * 0.015;
    }

    if (t - last_telem_ms >= 50) {
        last_telem_ms = t;
        fprintf(stdout, "{\"type\":\"imu_telemetry\",\"jerk\":%.5f,\"noise\":%.5f,\"thresh\":%.5f,\"typing\":%d}\n",
                typing ? 0.0 : window_peak_jerk, ema_noise, thresh, typing);
        fflush(stdout);
        window_peak_jerk = 0.0;
    }
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        wake_spu_drivers();
        CFMutableDictionaryRef matching = IOServiceMatching("AppleSPUHIDDevice");
        io_iterator_t iter = 0;
        if (IOServiceGetMatchingServices(kIOMainPortDefault, matching, &iter) != KERN_SUCCESS) {
            return 0;
        }
        io_service_t svc;
        int opened = 0;
        while ((svc = IOIteratorNext(iter)) != 0) {
            CFNumberRef upRef = IORegistryEntryCreateCFProperty(svc, CFSTR("PrimaryUsagePage"), kCFAllocatorDefault, 0);
            CFNumberRef uRef  = IORegistryEntryCreateCFProperty(svc, CFSTR("PrimaryUsage"), kCFAllocatorDefault, 0);
            int up = 0, u = 0;
            if (upRef) { CFNumberGetValue(upRef, kCFNumberIntType, &up); CFRelease(upRef); }
            if (uRef)  { CFNumberGetValue(uRef, kCFNumberIntType, &u); CFRelease(uRef); }
            if (up == 0xFF00 && u == 3) {
                IOHIDDeviceRef dev = IOHIDDeviceCreate(kCFAllocatorDefault, svc);
                if (dev && IOHIDDeviceOpen(dev, kIOHIDOptionsTypeNone) == kIOReturnSuccess) {
                    uint8_t *buf = (uint8_t *)calloc(1, 256);
                    IOHIDDeviceScheduleWithRunLoop(dev, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode);
                    IOHIDDeviceRegisterInputReportCallback(dev, buf, 256, accel_report_cb, NULL);
                    opened = 1;
                }
            }
            IOObjectRelease(svc);
        }
        IOObjectRelease(iter);
        if (!opened) return 0;
        fprintf(stdout, "{\"type\":\"spu_ready\"}\n");
        fflush(stdout);
        CFRunLoopRun();
    }
    return 0;
}
