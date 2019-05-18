
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Util = imports.misc.util;

let text, button;

function _hideTween() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _switchOutput() {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

	defsink = control.get_default_sink();
	if (!defsink) {
		return;
	}
	defport = defsink.get_port();
	if (!defport) {
		return;
	}

	if (defport.port != 'analog-output-headphones') {
		Util.spawnCommandLine ("pacmd set-sink-port 1 analog-output-headphones")
		icon_exec.icon_name = 'audio-headphones-symbolic';
		text.text = "Headphones";
	} else {
		Util.spawnCommandLine ("pacmd set-sink-port 1 analog-output-speaker");
		icon_exec.icon_name = 'audio-speakers-symbolic';
		text.text = "Speakers";
	}

	let new_defsink = control.get_default_sink();
	let new_defport = defsink ? defsink.get_port() : null;
	if (new_defport && new_defport.port != defport.port) {
		text.text = defport.human_port;
	}

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideTween });
}

let icon_exec = null;
let control = null;
let defsink = null;
let defport = null;

function init() {
	button = new St.Bin({ style_class: 'panel-button',
		reactive: true,
		can_focus: true,
		x_fill: true,
		y_fill: false,
		track_hover: true });

	icon_exec = new St.Icon({ icon_name: 'audio-card-symbolic',
		style_class: 'system-status-icon' });

	control = Main.panel.statusArea.aggregateMenu._volume._control; 
	if (control) {
		defsink = control.get_default_sink()
		defport = defsink ? defsink.get_port() : null;

		if (defport) {
			if (defsink.port == 'analog-output-headphones') {
				icon_exec.icon_name = 'audio-headphones-symbolic';
			} else {
				icon_exec.icon_name = 'audio-speakers-symbolic';
			}
		}
	}

	button.set_child(icon_exec);
	button.connect('button-press-event', _switchOutput);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
