#!/usr/bin/env bash
# Build libghostty.dylib from the ghostty source.
#
# Ghostty builds a static library (libghostty.a) via its xcframework target.
# We then create a shared library (dylib) from the static archive so it can
# be loaded at runtime via dlopen/Bun FFI.
#
# Prerequisites: zig (version from build.zig.zon), clang (Xcode CLI tools)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NATIVE_DIR="$SCRIPT_DIR/../src/native"
OUT_DIR="$NATIVE_DIR/zig-out/lib"
INCLUDE_DIR="$NATIVE_DIR/zig-out/include"

# Step 1: Find ghostty source in zig global cache
# The zig package manager stores dependencies under ~/.cache/zig/p/
GHOSTTY_HASH="ghostty-1.3.0-dev-5UdBC99KSQQrHDiWG9hjKVI9EdfAgrNEG-L2z5s1AA1g"
GHOSTTY_SRC="$HOME/.cache/zig/p/$GHOSTTY_HASH"

if [ ! -d "$GHOSTTY_SRC" ]; then
  echo "Ghostty source not found in zig cache. Fetching dependency..."
  cd "$NATIVE_DIR"
  zig build 2>&1
  if [ ! -d "$GHOSTTY_SRC" ]; then
    echo "ERROR: Could not find ghostty source after fetching."
    echo "Expected at: $GHOSTTY_SRC"
    exit 1
  fi
fi

echo "Found ghostty source at: $GHOSTTY_SRC"

# Step 2: Build ghostty with -Dapp-runtime=none (libghostty mode)
# This produces the static library and xcframework
echo "Building ghostty (this may take several minutes on first build)..."
cd "$GHOSTTY_SRC"
zig build \
  -Dapp-runtime=none \
  -Demit-macos-app=false \
  -Doptimize=ReleaseFast \
  2>&1

# Step 3: Find the xcframework static library (universal binary)
XCFW_LIB="$GHOSTTY_SRC/macos/GhosttyKit.xcframework/macos-arm64_x86_64/libghostty.a"

if [ ! -f "$XCFW_LIB" ]; then
  echo "ERROR: xcframework static library not found at: $XCFW_LIB"
  echo "Build may have failed or produced output in a different location."
  exit 1
fi

echo "Found xcframework lib: $XCFW_LIB ($(du -h "$XCFW_LIB" | cut -f1))"

# Step 4: Detect architecture and extract slice
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  CLANG_ARCH="arm64"
elif [ "$ARCH" = "x86_64" ]; then
  CLANG_ARCH="x86_64"
else
  echo "ERROR: Unsupported architecture: $ARCH"
  exit 1
fi

echo "Building dylib for architecture: $CLANG_ARCH"

# Extract single-arch slice from universal binary
TEMP_LIB=$(mktemp /tmp/libghostty_XXXXXX.a)
trap "rm -f $TEMP_LIB" EXIT

lipo "$XCFW_LIB" -thin "$CLANG_ARCH" -output "$TEMP_LIB"

# Step 5: Create shared library from static archive
mkdir -p "$OUT_DIR"

clang -dynamiclib -arch "$CLANG_ARCH" \
  -o "$OUT_DIR/libghostty.dylib" \
  -all_load "$TEMP_LIB" \
  -framework Metal -framework MetalKit -framework QuartzCore \
  -framework CoreGraphics -framework CoreText -framework Foundation \
  -framework AppKit -framework IOKit -framework IOSurface \
  -framework UniformTypeIdentifiers -framework CoreFoundation \
  -framework GameController -framework Carbon \
  -lc++ -lobjc -liconv -lz \
  -install_name @rpath/libghostty.dylib \
  -mmacosx-version-min=13.0

echo "Successfully built: $OUT_DIR/libghostty.dylib"
ls -lh "$OUT_DIR/libghostty.dylib"

# Step 6: Verify symbols
SYMBOL_COUNT=$(nm "$OUT_DIR/libghostty.dylib" 2>/dev/null | grep -c "T _ghostty_" || true)
echo "Exported ghostty symbols: $SYMBOL_COUNT"

if [ "$SYMBOL_COUNT" -eq 0 ]; then
  echo "WARNING: No ghostty symbols found in dylib!"
  exit 1
fi

# Step 7: Copy header
if [ -f "$GHOSTTY_SRC/include/ghostty.h" ]; then
  mkdir -p "$INCLUDE_DIR"
  cp "$GHOSTTY_SRC/include/ghostty.h" "$INCLUDE_DIR/"
  echo "Copied ghostty.h header"
fi

echo "Done!"
