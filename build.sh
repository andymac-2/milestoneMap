#!/bin/bash

mkdir -p dist
cd dist

npx google-closure-compiler \
    -O ADVANCED\
    --js_output_file bundle.js\
    --create_source_map bundle.js.map\
    --output_wrapper '%output% //# sourceMappingURL=bundle.js.map'\
    -W VERBOSE\
    -D NDEBUG=true\
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
    ../src/draw/inputs.js\
    ../src/draw/elements.js\
    ../src/draw/svgTextInput.js\
    ../src/draw/svgDateInput.js\
    ../src/onUnclick.js\
    ../src/util.js

cp ../src/main.css main.css
cp ../src/electron_package.json package.json
cp ../src/electron_main.js main.js
cp ../src/dist/index.html index.html
cp -R ../src/icons .

cd ..

npx electron-packager dist MilestoneMap --overwrite --all --out=bin

rm dist/package.json
