#!/bin/bash

mkdir -p dist
cd dist

npx google-closure-compiler \
    -O ADVANCED\
    --js_output_file bundle.js\
    --create_source_map bundle.js.map\
    --output_wrapper '%output% //# sourceMappingURL=bundle.js.map'\
    -W VERBOSE\
    -D NDEBUG=false\
    ../src/main.js\
    ../src/tests.js\
    ../src/assert.js\
    ../src/milestoneMap.js\
    ../src/milestoneMap/dateHeader.js\
    ../src/milestoneMap/milestone.js\
    ../src/milestoneMap/project.js\
    ../src/milestoneMap/programme.js\
    ../src/milestoneMap/msAtReport.js\
    ../src/milestoneMap/report.js\
    ../src/milestoneMap/dependency.js\
    ../src/milestoneMap/businessMs.js\
    ../src/milestoneMap/milestoneTD.js\
    ../src/loader.js\
    ../src/draw.js\
    ../src/draw/lines.js\
    ../src/draw/domUtils.js\
    ../src/draw/menu.js\
    ../src/draw/elements.js\
    ../src/draw/svgTextInput.js\
    ../src/draw/svgDateInput.js\
    ../src/onUnclick.js\
    ../src/util.js

cp ../src/main.css main.css
cp ../src/dist/index.html index.html
cp -R ../src/icons icons
      

