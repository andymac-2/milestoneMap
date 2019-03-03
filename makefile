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

.PHONY : webapp debug release
webapp : dist/bundle.js dist/main.css dist/index.html dist/icons
# debug will force a compilation
debug : dist/main.css dist/index.html dist/icons
	npx google-closure-compiler\
		-O ADVANCED\
		--js_output_file dist/bundle.js\
		--create_source_map dist/bundle.js.map\
		--output_wrapper '%output% //# sourceMappingURL=bundle.js.map'\
		-W VERBOSE\
		--debug\
		--use_types_for_optimization\
		$(files)
release : docs/main.css docs/index.html docs/bundle.js docs/icons

dist :
	mkdir dist
dist/bundle.js : $(files) dist
	npx google-closure-compiler \
		-O ADVANCED\
		--js_output_file dist/bundle.js\
		--isolation_mode IIFE\
		--assume_function_wrapper\
		-W VERBOSE\
		-D NDEBUG=true\
		--use_types_for_optimization\
		$(files)
dist/main.css : src/main.css dist
	cp src/main.css dist/main.css
dist/index.html : src/dist/index.html dist
	cp src/dist/index.html dist/index.html
dist/icons : dist
	cp -R src/icons dist

docs :
	mkdir docs
docs/main.css : dist/main.css docs
	cp dist/main.css docs/main.css
docs/index.html : dist/index.html docs
	cp dist/index.html docs/index.html
docs/bundle.js : dist/bundle.js docs
	cp dist/bundle.js docs/bundle.js
docs/icons : docs
	cp -R src/icons docs
