// Native macOS System-Wide Continuity Bridge (`oneglass_os.m`)
// Breaks OneGlass out of the browser tab across the entire macOS operating system:
//   1. Native Always-On-Top Screen-Edge Bezel Strip (`NSWindow` on `NSScreen.mainScreen`)
//      that catches files dragged directly from macOS Finder / Desktop (`NSPasteboardTypeFileURL`)
//      even when the browser is minimized or closed!
//   2. System-Wide OS Mouse Cursor, Click & Scroll Injection (`CGEventPost(kCGHIDEventTap, ...)`)
//      so the Phone Glass Trackpad controls the REAL macOS cursor across Finder, Cursor, Dock, etc.
//   3. System-Wide Click-Through Keynote Laser & Bezel Glow Overlay (`ignoresMouseEvents = YES`).
//   4. Two-Way System Clipboard Sync (`NSPasteboard.generalPasteboard` <-> Phone).

#import <Cocoa/Cocoa.h>
#import <CoreGraphics/CoreGraphics.h>
#import <QuartzCore/QuartzCore.h>

static void emit_json(NSDictionary *dict) {
    NSError *err = nil;
    NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&err];
    if (data && !err) {
        NSString *line = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        fprintf(stdout, "%s\n", [line UTF8String]);
        fflush(stdout);
    }
}

// ----------------------------------------------------------------------------
// 1. Native Screen-Edge Bezel Drop View (Accepts Finder Drag-and-Drop!)
// ----------------------------------------------------------------------------
@interface BezelStripView : NSView <NSDraggingDestination>
@property (nonatomic, assign) BOOL hovered;
@property (nonatomic, assign) CGFloat flashAlpha;
@property (nonatomic, copy) NSString *edge;
@end

@implementation BezelStripView

- (instancetype)initWithFrame:(NSRect)frameRect {
    if ((self = [super initWithFrame:frameRect])) {
        [self registerForDraggedTypes:@[NSPasteboardTypeFileURL]];
        _hovered = NO;
        _flashAlpha = 0.0;
    }
    return self;
}

- (NSDragOperation)draggingEntered:(id<NSDraggingInfo>)sender {
    _hovered = YES;
    [self setNeedsDisplay:YES];
    emit_json(@{@"type": @"os_bezel_hover", @"active": @YES});
    return NSDragOperationCopy;
}

- (void)draggingExited:(id<NSDraggingInfo>)sender {
    _hovered = NO;
    [self setNeedsDisplay:YES];
    emit_json(@{@"type": @"os_bezel_hover", @"active": @NO});
}

- (BOOL)performDragOperation:(id<NSDraggingInfo>)sender {
    _hovered = NO;
    _flashAlpha = 1.0;
    [self setNeedsDisplay:YES];

    NSPasteboard *pb = [sender draggingPasteboard];
    NSArray<NSURL *> *urls = [pb readObjectsForClasses:@[[NSURL class]]
                                               options:@{NSPasteboardURLReadingFileURLsOnlyKey: @YES}];
    NSMutableArray<NSString *> *paths = [NSMutableArray array];
    for (NSURL *u in urls) {
        if (u.path) [paths addObject:u.path];
    }
    if (paths.count > 0) {
        emit_json(@{@"type": @"os_file_drop", @"paths": paths});
        return YES;
    }
    return NO;
}

- (void)drawRect:(NSRect)dirtyRect {
    [[NSColor clearColor] setFill];
    NSRectFill(dirtyRect);

    // Stay 100% invisible at rest; ONLY show when actively dragging a file over the edge!
    if (!_hovered && _flashAlpha <= 0.02) {
        return;
    }

    NSRect b = self.bounds;
    CGFloat w = 10.0;
    NSRect pill;
    NSString *e = _edge ?: @"right";
    if ([e isEqualToString:@"left"]) {
        pill = NSMakeRect(2.0, 8.0, w, fmax(4.0, b.size.height - 16.0));
    } else if ([e isEqualToString:@"top"]) {
        pill = NSMakeRect(8.0, b.size.height - w - 2.0, fmax(4.0, b.size.width - 16.0), w);
    } else if ([e isEqualToString:@"bottom"]) {
        pill = NSMakeRect(8.0, 2.0, fmax(4.0, b.size.width - 16.0), w);
    } else {
        pill = NSMakeRect(b.size.width - w - 2.0, 8.0, w, fmax(4.0, b.size.height - 16.0));
    }
    NSBezierPath *path = [NSBezierPath bezierPathWithRoundedRect:pill xRadius:w/2.0 yRadius:w/2.0];
    [[NSColor colorWithSRGBRed:0.22 green:0.74 blue:0.98 alpha:(_hovered ? 0.85 : _flashAlpha * 0.85)] setFill];
    [path fill];
}

@end

// ----------------------------------------------------------------------------
// 2. System-Wide Click-Through Laser & Edge Flash View
// ----------------------------------------------------------------------------
@interface LaserOverlayView : NSView
@property (nonatomic, assign) BOOL laserActive;
@property (nonatomic, assign) NSPoint laserPt;
@property (nonatomic, assign) CGFloat edgeFlash;
@property (nonatomic, copy) NSString *edge;
@end

@implementation LaserOverlayView

- (void)drawRect:(NSRect)dirtyRect {
    [[NSColor clearColor] setFill];
    NSRectFill(dirtyRect);

    if (_edgeFlash > 0.02) {
        NSRect b = self.bounds;
        NSGradient *grad = [[NSGradient alloc] initWithStartingColor:[NSColor colorWithSRGBRed:0.37 green:0.42 blue:0.82 alpha:_edgeFlash * 0.55]
                                                         endingColor:[NSColor clearColor]];
        NSString *e = _edge ?: @"right";
        if ([e isEqualToString:@"left"]) {
            [grad drawInRect:NSMakeRect(0, 0, 140.0, b.size.height) angle:0.0];
        } else if ([e isEqualToString:@"top"]) {
            [grad drawInRect:NSMakeRect(0, b.size.height - 140.0, b.size.width, 140.0) angle:270.0];
        } else if ([e isEqualToString:@"bottom"]) {
            [grad drawInRect:NSMakeRect(0, 0, b.size.width, 140.0) angle:90.0];
        } else {
            [grad drawInRect:NSMakeRect(b.size.width - 140.0, 0, 140.0, b.size.height) angle:180.0];
        }
    }
    if (_laserActive) {
        NSRect outer = NSMakeRect(_laserPt.x - 18.0, _laserPt.y - 18.0, 36.0, 36.0);
        NSBezierPath *glow = [NSBezierPath bezierPathWithOvalInRect:outer];
        [[NSColor colorWithSRGBRed:0.96 green:0.25 blue:0.37 alpha:0.32] setFill];
        [glow fill];

        NSRect core = NSMakeRect(_laserPt.x - 6.0, _laserPt.y - 6.0, 12.0, 12.0);
        NSBezierPath *dot = [NSBezierPath bezierPathWithOvalInRect:core];
        [[NSColor colorWithSRGBRed:1.0 green:0.28 blue:0.38 alpha:0.96] setFill];
        [dot fill];
        [[NSColor whiteColor] setStroke];
        [dot setLineWidth:1.5];
        [dot stroke];
    }
}

@end

// ----------------------------------------------------------------------------
// 3. Main Controller (Stdin Command Loop + Clipboard Watcher + CGEvent Cursor)
// ----------------------------------------------------------------------------
@interface OneGlassOSController : NSObject <NSApplicationDelegate>
@property (nonatomic, strong) NSWindow *stripWindow;
@property (nonatomic, strong) BezelStripView *stripView;
@property (nonatomic, strong) NSWindow *laserWindow;
@property (nonatomic, strong) LaserOverlayView *laserView;
@property (nonatomic, assign) NSInteger lastChangeCount;
@property (nonatomic, strong) NSString *lastWrittenClip;
@end

@implementation OneGlassOSController

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
    NSScreen *screen = [NSScreen mainScreen];
    NSRect sf = screen.frame;

    // 1. Native Screen-Edge Bezel Strip Window (catches Finder file drops anywhere on macOS!)
    CGFloat stripH = fmin(340.0, sf.size.height * 0.36);
    NSRect stripFrame = NSMakeRect(sf.origin.x + sf.size.width - 24.0,
                                   sf.origin.y + (sf.size.height - stripH) / 2.0,
                                   24.0,
                                   stripH);
    _stripWindow = [[NSWindow alloc] initWithContentRect:stripFrame
                                               styleMask:NSWindowStyleMaskBorderless
                                                 backing:NSBackingStoreBuffered
                                                   defer:NO];
    [_stripWindow setOpaque:NO];
    [_stripWindow setBackgroundColor:[NSColor clearColor]];
    [_stripWindow setLevel:NSStatusWindowLevel + 1];
    [_stripWindow setCollectionBehavior:NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary | NSWindowCollectionBehaviorStationary];
    [_stripWindow setIgnoresMouseEvents:NO];

    _stripView = [[BezelStripView alloc] initWithFrame:NSMakeRect(0, 0, stripFrame.size.width, stripFrame.size.height)];
    _stripView.edge = @"right";
    [_stripWindow setContentView:_stripView];
    [_stripWindow orderFrontRegardless];
    [self updateStripWithEdge:@"right" centerRatio:0.5 lengthMm:150.0];
    // 2. Full-Screen Click-Through Laser & Flash Window
    _laserWindow = [[NSWindow alloc] initWithContentRect:sf
                                               styleMask:NSWindowStyleMaskBorderless
                                                 backing:NSBackingStoreBuffered
                                                   defer:NO];
    [_laserWindow setOpaque:NO];
    [_laserWindow setBackgroundColor:[NSColor clearColor]];
    [_laserWindow setLevel:NSStatusWindowLevel + 2];
    [_laserWindow setCollectionBehavior:NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary | NSWindowCollectionBehaviorStationary];
    [_laserWindow setIgnoresMouseEvents:YES];

    _laserView = [[LaserOverlayView alloc] initWithFrame:NSMakeRect(0, 0, sf.size.width, sf.size.height)];
    [_laserWindow setContentView:_laserView];
    [_laserWindow orderFrontRegardless];

    // 3. Monitor macOS System Clipboard (`NSPasteboard.generalPasteboard`)
    _lastChangeCount = [[NSPasteboard generalPasteboard] changeCount];
    [NSTimer scheduledTimerWithTimeInterval:0.45 repeats:YES block:^(NSTimer * _Nonnull timer) {
        NSPasteboard *pb = [NSPasteboard generalPasteboard];
        if (pb.changeCount != self.lastChangeCount) {
            self.lastChangeCount = pb.changeCount;
            NSString *str = [pb stringForType:NSPasteboardTypeString];
            if (str && str.length > 0 && str.length < 32000 && ![str isEqualToString:self.lastWrittenClip]) {
                emit_json(@{@"type": @"os_clipboard", @"text": str});
            }
        }
        if (self.laserView.edgeFlash > 0.01) {
            self.laserView.edgeFlash *= 0.82;
            [self.laserView setNeedsDisplay:YES];
        }
    }];

    // 4. Read JSON commands from `server.mjs` over stdin on a background queue
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        char line[65536];
        while (fgets(line, sizeof(line), stdin) != NULL) {
            NSData *d = [NSData dataWithBytes:line length:strlen(line)];
            NSDictionary *cmd = [NSJSONSerialization JSONObjectWithData:d options:0 error:nil];
            if (![cmd isKindOfClass:[NSDictionary class]]) continue;
            dispatch_async(dispatch_get_main_queue(), ^{
                [self handleCommand:cmd];
            });
        }
        exit(0);
    });

    emit_json(@{@"type": @"os_bridge_ready"});
}

- (void)updateStripWithEdge:(NSString *)edge centerRatio:(double)cr lengthMm:(double)lengthMm {
    NSScreen *screen = [NSScreen mainScreen];
    NSRect sf = screen.frame;

    NSString *e = [edge lowercaseString];
    if (!e || (![e isEqualToString:@"top"] && ![e isEqualToString:@"bottom"] && ![e isEqualToString:@"left"] && ![e isEqualToString:@"right"])) {
        e = @"right";
    }

    double centerRatio = fmax(0.05, fmin(0.95, cr > 0.0 ? cr : 0.5));
    CGFloat thickness = 24.0;
    NSRect stripFrame;

    if ([e isEqualToString:@"top"] || [e isEqualToString:@"bottom"]) {
        CGFloat defaultLen = fmin(380.0, sf.size.width * 0.36);
        CGFloat stripLen = (lengthMm > 0.0) ? (CGFloat)(lengthMm * 72.0 / 25.4) : defaultLen;
        stripLen = fmax(60.0, fmin(sf.size.width - 24.0, stripLen));
        CGFloat centerX = sf.origin.x + centerRatio * sf.size.width;
        CGFloat xOrig = centerX - stripLen / 2.0;
        xOrig = fmax(sf.origin.x + 4.0, fmin(sf.origin.x + sf.size.width - stripLen - 4.0, xOrig));
        CGFloat yOrig = [e isEqualToString:@"top"] ? (sf.origin.y + sf.size.height - thickness) : sf.origin.y;
        stripFrame = NSMakeRect(xOrig, yOrig, stripLen, thickness);
    } else {
        CGFloat defaultLen = fmin(340.0, sf.size.height * 0.36);
        CGFloat stripLen = (lengthMm > 0.0) ? (CGFloat)(lengthMm * 72.0 / 25.4) : defaultLen;
        stripLen = fmax(60.0, fmin(sf.size.height - 24.0, stripLen));
        CGFloat centerY = sf.origin.y + (1.0 - centerRatio) * sf.size.height;
        CGFloat yOrig = centerY - stripLen / 2.0;
        yOrig = fmax(sf.origin.y + 4.0, fmin(sf.origin.y + sf.size.height - stripLen - 4.0, yOrig));
        CGFloat xOrig = [e isEqualToString:@"left"] ? sf.origin.x : (sf.origin.x + sf.size.width - thickness);
        stripFrame = NSMakeRect(xOrig, yOrig, thickness, stripLen);
    }

    [_stripWindow setFrame:stripFrame display:YES animate:NO];
    _stripView.frame = NSMakeRect(0, 0, stripFrame.size.width, stripFrame.size.height);
    _stripView.edge = e;
    [_stripView setNeedsDisplay:YES];
    _laserView.edge = e;
}

- (void)handleCommand:(NSDictionary *)cmd {
    NSString *type = cmd[@"cmd"];
    NSScreen *screen = [NSScreen mainScreen];
    NSRect sf = screen.frame;

    if ([type isEqualToString:@"cursor"]) {
        double xr = [cmd[@"xRatio"] doubleValue];
        double yr = [cmd[@"yRatio"] doubleValue];
        BOOL clicking = [cmd[@"clicking"] boolValue];
        BOOL laser = [cmd[@"laser"] boolValue];

        // CGEvent coordinates have (0,0) at top-left of main display
        CGFloat cgX = fmax(2.0, fmin(sf.size.width - 2.0, xr * sf.size.width));
        CGFloat cgY = fmax(2.0, fmin(sf.size.height - 2.0, yr * sf.size.height));
        CGPoint pt = CGPointMake(cgX, cgY);

        CGWarpMouseCursorPosition(pt);
        CGEventRef moveEv = CGEventCreateMouseEvent(NULL, kCGEventMouseMoved, pt, kCGMouseButtonLeft);
        if (moveEv) {
            CGEventPost(kCGHIDEventTap, moveEv);
            CFRelease(moveEv);
        }

        if (clicking) {
            CGEventRef downEv = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseDown, pt, kCGMouseButtonLeft);
            CGEventRef upEv   = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseUp, pt, kCGMouseButtonLeft);
            if (downEv && upEv) {
                CGEventPost(kCGHIDEventTap, downEv);
                CGEventPost(kCGHIDEventTap, upEv);
            }
            if (downEv) CFRelease(downEv);
            if (upEv) CFRelease(upEv);
        }

        // Update system-wide laser overlay (Cocoa coordinates have (0,0) at bottom-left)
        _laserView.laserActive = laser;
        _laserView.laserPt = NSMakePoint(cgX, sf.size.height - cgY);
        [_laserView setNeedsDisplay:YES];
    } else if ([type isEqualToString:@"clipboard"]) {
        NSString *text = cmd[@"text"];
        if ([text isKindOfClass:[NSString class]] && text.length > 0) {
            _lastWrittenClip = text;
            NSPasteboard *pb = [NSPasteboard generalPasteboard];
            [pb clearContents];
            [pb setString:text forType:NSPasteboardTypeString];
            _lastChangeCount = pb.changeCount;
        }
    } else if ([type isEqualToString:@"set_strip"]) {
        NSString *edge = cmd[@"edge"];
        double centerRatio = [cmd[@"centerRatio"] isKindOfClass:[NSNumber class]] ? [cmd[@"centerRatio"] doubleValue] : 0.5;
        double lengthMm = [cmd[@"lengthMm"] isKindOfClass:[NSNumber class]] ? [cmd[@"lengthMm"] doubleValue] : 150.0;
        [self updateStripWithEdge:edge centerRatio:centerRatio lengthMm:lengthMm];
    } else if ([type isEqualToString:@"flash"]) {
        if ([cmd[@"edge"] isKindOfClass:[NSString class]]) {
            _laserView.edge = cmd[@"edge"];
        }
        _laserView.edgeFlash = 1.0;
        [_laserView setNeedsDisplay:YES];
    }
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        [app setActivationPolicy:NSApplicationActivationPolicyAccessory];
        OneGlassOSController *ctrl = [[OneGlassOSController alloc] init];
        [app setDelegate:ctrl];
        [app run];
    }
    return 0;
}
