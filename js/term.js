(function () {
	var glob = window;

	glob.InlineTerminal = function (cont, base_url, config) {
		cont = $(cont);
		var dom = cont[0];
		var config = $.extend({}, config);

		var socket, term;

		// function resize(cols, rows) {
		// 	cont.width(cols * cwidth);
		// 	cont.height(rows * cheight);
		// 	term.resize(cols, rows);
		// }

		function init(cwidth, cheight) {
			cont.children().remove();

			var cols = Math.floor(cont.width() / cwidth);
			var rows = Math.floor(cont.height() / cheight);

			// alert([ cont.width(), cols, rows, cwidth ]);

			term = new Terminal({
				cursorBlink: true,
				scrollback: 1024,
				tabStopWidth: 4,

				cols: cols,
				rows: rows
			});

			term.on("resize", function (size) {
				if (!pid) return;

				var cols = size.cols,
					rows = size.rows,
					url = "http://" + base_url + "/term/" + pid + "/size?cols=" + cols + "&rows=" + rows;

				fetch(url, { method: "POST" });
			});

			var proto = (location.protocol === "https:") ? "wss://" : "ws://";
			var url = proto + base_url + "/term";

			var pid;

			term.open(dom, true);

			// cont.ready(function () {
			// 	alert(term.charMeasure.width);
			// 	// cwidth = cont.find(".xterm-rows").width() / cols;
			// 	// cheight = cont.find(".xterm-rows").height() / rows;

			// 	// cols = Math.floor(cont.width() / cwidth - 5);
			// 	// rows = Math.floor(cont.height() / cheight - 5);

			// 	// console.log([ cols, rows ]);

			// 	// term.resize(54, 19);
			// 	// // term.charMeasure.measure();
			// });

			fetch("http://" + base_url + "/term?cols=" + cols + "&rows=" + rows, { method: "POST" }).then(function (res) {
				res.text().then(function (npid) {
					pid = npid;
					url += "/" + pid;
					socket = new WebSocket(url);
					socket.onopen = run;
				});
			});
		}

		function run() {
			term.attach(socket);
			term._initialized = true;
		}

		var helper = $('<div class="terminal xterm xterm-theme-default xterm-cursor-blink" tabindex="0"><div class="xterm-helpers"><textarea class="xterm-helper-textarea" autocorrect="off" autocapitalize="off" spellcheck="false" tabindex="0"></textarea><div class="composition-view"></div></div></div>');
		cont.append(helper);

		var char = new CharMeasure(document, helper[0]);
		char.measure();

		setTimeout(function () {
			init(char.width, char.height);

			if (config.onFocus) {
				$(term.textarea).focus(config.onFocus);
			}

			if (config.onBlur) {
				$(term.textarea).blur(config.onBlur);
			}
		}, 0);

		var ret = {};

		return ret;
	};
})();