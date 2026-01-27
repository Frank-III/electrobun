"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentImageItem = AgentImageItem;
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
var hover_card_1 = require("../../../components/ui/hover-card");
function AgentImageItem(_a) {
    var id = _a.id, filename = _a.filename, url = _a.url, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, onRemove = _a.onRemove, allImages = _a.allImages, _c = _a.imageIndex, imageIndex = _c === void 0 ? 0 : _c;
    var _d = (0, solid_js_1.createSignal)(false), isHovered = _d[0], setIsHovered = _d[1];
    var _e = (0, solid_js_1.createSignal)(false), hasError = _e[0], setHasError = _e[1];
    var _f = (0, solid_js_1.createSignal)(false), isFullscreen = _f[0], setIsFullscreen = _f[1];
    var _g = (0, solid_js_1.createSignal)(imageIndex), currentIndex = _g[0], setCurrentIndex = _g[1];
    // Use allImages if provided, otherwise create single-image array
    var images = allImages || [{
            id: id,
            filename: filename,
            url: url
        }];
    var hasMultipleImages = images.length > 1;
    var currentImage = images[currentIndex] || images[0];
    var handleImageError = function () {
        console.warn("[AgentImageItem] Failed to load image:", filename, url);
        setHasError(true);
    };
    var openFullscreen = function () {
        setCurrentIndex(imageIndex);
        setIsFullscreen(true);
    };
    var closeFullscreen = function () {
        setIsFullscreen(false);
    };
    var goToPrevious = function (e) {
        e === null || e === void 0 ? void 0 : e.stopPropagation();
        setCurrentIndex(function (prev) { return prev > 0 ? prev - 1 : images.length - 1; });
    };
    var goToNext = function (e) {
        e === null || e === void 0 ? void 0 : e.stopPropagation();
        setCurrentIndex(function (prev) { return prev < images.length - 1 ? prev + 1 : 0; });
    };
    // Handle keyboard navigation
    (0, solid_js_1.createEffect)(function () {
        if (!isFullscreen)
            return;
        var handleKeyDown = function (e) {
            switch (e.key) {
                case "Escape":
                    e.preventDefault();
                    e.stopPropagation();
                    closeFullscreen();
                    break;
                case "ArrowLeft":
                    if (hasMultipleImages)
                        goToPrevious();
                    break;
                case "ArrowRight":
                    if (hasMultipleImages)
                        goToNext();
                    break;
            }
        };
        // Use capture phase to intercept before other handlers
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    });
    return <>
      <div class="relative" onMouseEnter={function () { return setIsHovered(true); }} onMouseLeave={function () { return setIsHovered(false); }}>
        {isLoading ? <div class="size-8 flex items-center justify-center bg-muted rounded">
            <icons_1.IconSpinner class="size-4 text-muted-foreground"/>
          </div> : hasError ? <div class="size-8 flex items-center justify-center bg-muted/50 rounded border border-destructive/20" title="Failed to load image">
            <lucide_solid_1.ImageOff class="size-4 text-destructive/50"/>
          </div> : url ? <hover_card_1.HoverCard openDelay={200}>
            <hover_card_1.HoverCardTrigger asChild>
              <img src={url} alt={filename} class="size-8 object-cover rounded cursor-pointer" onClick={openFullscreen} onError={handleImageError}/>
            </hover_card_1.HoverCardTrigger>
            <hover_card_1.HoverCardContent class="w-auto max-w-72 p-0" side="top">
              <img src={url} alt={filename} class="max-w-72 max-h-72 w-auto h-auto object-contain rounded-[10px]" onError={handleImageError}/>
            </hover_card_1.HoverCardContent>
          </hover_card_1.HoverCard> : <div class="size-8 bg-muted rounded flex items-center justify-center">
            <icons_1.IconSpinner class="size-4 text-muted-foreground"/>
          </div>}

        {onRemove && <button onClick={function (e) {
                e.stopPropagation();
                onRemove();
            }} class={"absolute -top-1.5 -right-1.5 size-4 rounded-full bg-background border border-border\n                       flex items-center justify-center transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] z-10\n                       text-muted-foreground hover:text-foreground\n                       ".concat(isHovered ? "opacity-100" : "opacity-0")} type="button">
            <lucide_solid_1.X class="size-3"/>
          </button>}
      </div>

      {/* Fullscreen overlay with gallery navigation - rendered via portal to escape stacking context */}
      {isFullscreen && (currentImage === null || currentImage === void 0 ? void 0 : currentImage.url) && (0, web_1.createPortal)(<div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={closeFullscreen}>
          {/* Close button */}
          <button onClick={closeFullscreen} class="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white z-10" type="button" aria-label="Close fullscreen (Esc)">
            <lucide_solid_1.X class="size-6"/>
          </button>

          {/* Previous button */}
          {hasMultipleImages && <button onClick={goToPrevious} class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white z-10" type="button" aria-label="Previous image (←)">
              <lucide_solid_1.ChevronLeft class="size-8"/>
            </button>}

          {/* Image */}
          <img src={currentImage.url} alt={currentImage.filename} class="max-w-[90vw] max-h-[85vh] object-contain" onClick={function (e) { return e.stopPropagation(); }}/>

          {/* Next button */}
          {hasMultipleImages && <button onClick={goToNext} class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white z-10" type="button" aria-label="Next image (→)">
              <lucide_solid_1.ChevronRight class="size-8"/>
            </button>}

          {/* Image counter and dots */}
          {hasMultipleImages && <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              {/* Dots indicator */}
              <div class="flex gap-2">
                {images.map(function (_, idx) { return <button key={idx} onClick={function (e) {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                    }} class={"size-2 rounded-full transition-all ".concat(idx === currentIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60")} type="button" aria-label={"Go to image ".concat(idx + 1)}/>; })}
              </div>
              {/* Counter text */}
              <span class="text-white/70 text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            </div>}
        </div>, document.body)}
    </>;
}
