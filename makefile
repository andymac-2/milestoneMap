.PHONY : webapp electron
webapp : dist/bundle.js dist/main.css dist/index.html icons
electron : webapp dist/package.json dist/main.js
	npx electron-packager dist MilestoneMap --overwrite --all --out=bin
	rm dist/package.json


files = src/main.js\
    src/tests.js\
    src/assert.js\
    src/milestoneMap.js\
    src/milestoneMap/dateHeader.js\
    src/milestoneMap/milestone.js\
    src/milestoneMap/project.js\
    src/milestoneMap/programme.js\
    src/milestoneMap/msAtReport.js\
    src/milestoneMap/report.js\
    src/milestoneMap/dependency.js\
    src/milestoneMap/businessMs.js\
    src/milestoneMap/milestoneTD.js\
    src/loader.js\
    src/draw.js\
    src/draw/lines.js\
    src/draw/domUtils.js\
    src/draw/menu.js\
    src/draw/inputs.js\
    src/draw/elements.js\
    src/draw/svgTextInput.js\
    src/draw/svgDateInput.js\
    src/onUnclick.js\
    src/util.js


dist/bundle.js : $(files)
	npx google-closure-compiler \
		-O ADVANCED\
    	--js_output_file dist/bundle.js\
    	--create_source_map dist/bundle.js.map\
    	--output_wrapper '%output% //# sourceMappingURL=bundle.js.map'\
    	-W VERBOSE\
    	-D NDEBUG=true\
		$(files)
dist/main.css : src/main.css
	cp src/main.css dist/main.css
dist/index.html : src/dist/index.html
	cp src/dist/index.html dist/index.html
.PHONY : icons
icons : 
	cp -R src/icons dist


dist/package.json : src/electron_package.json
	cp src/electron_package.json dist/package.json
dist/main.js : src/main.js
	cp src/electron_main.js dist/main.js
