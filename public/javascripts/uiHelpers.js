"use strict";

/**
 * Creates a jQuery collection of elements and text created from an HTML
 * string. Unlike $(), this does not require a root element.
 *
 * @param html The HTML to parse into elements and text.
 * @return The jQuery collection of that HTML.
 */
function $html(html) {
	let div = document.createElement("div");
	div.innerHTML = html;
	return $(div.childNodes);
}

/**
 * Creates a jQuery collection that contains a single TextNode containing the
 * specified text.
 *
 * @param text The text to place in the TextNode.
 * @return The jQuery collection containing that text.
 */
function $text(text) {
	return $(document.createTextNode(text));
}

/**
 * Searches for a <template> element with the specified ID in the document
 * HTML, clones it, and returns a jQuery collection of the template's children.
 *
 * @param id The ID of the template to clone.
 * @return The jQuery collection of that template's cloned contents.
 */
function $template(id) {
	return $(document.getElementById(id).content.cloneNode(true).childNodes);
}

/**
 * Interface for creating popup dialogs with title, content, and buttons.
 * The returned object has methods for adding content and buttons with event
 * handlers to the popup. All methods support method chaining, like so:
 *
 *     new Dialog("Message")
 *         .text("Hello, world")
 *         .accept(e => {
 *             console.log("They clicked OK");
 *         })
 *         .show();
 *
 * It is entirely possible to show multiple dialogs on the screen at the same
 * time; they will be shown next to each other.
 */
class Dialog {
	/**
	 * Constructs a new blank dialog with the specified title.
	 *
	 * @param title (optional) The title to put on the dialog box.
	 */
	constructor(title = "") {
		this.dialog = $template("tem-dialog");

		this.titleText = this.dialog.find(".dialog-title")
			.text(title);
		this.header = this.dialog.find(".dialog-header");
		this.close = this.dialog.find(".dialog-x");
		this.content = this.dialog.find(".dialog-content");
		this.buttons = this.dialog.find(".dialog-buttons");

		// By default, the X closes the form. The cancel() method can change
		// this behavior, however.
		this.hideOnClose = true;
		this.close.on("click", e => {
			if (this.hideOnClose) {
				this.hide()
			}
		});
	}

	/**
	 * Adds an element or a set of elements to the content area of the dialog.
	 *
	 * @param elems The element(s) to add.
	 * @return this
	 */
	add(elems) {
		this.content.append(elems);
		return this;
	}

	/**
	 * Adds plain text to the content area of the dialog.
	 *
	 * @param text The text to add.
	 * @return this
	 */
	text(text) {
		this.add($text(text));
		return this;
	}

	/**
	 * Clears all elements and text from the content area of the dialog,
	 * allowing new elements to be added. Buttons and the title are unaffected.
	 *
	 * @return this
	 */
	clear() {
		this.content.empty();
		return this;
	}

	/**
	 * Replaces the title of the dialog with new text.
	 *
	 * @param text The text to put in the title of the dialog.
	 * @return this
	 */
	title(text) {
		this.titleText.text(text);
		return this;
	}

	/**
	 * Adds a button to the button area of the dialog and optionally binds an
	 * event to it as well.
	 *
	 * @param text  The text to put on the button.
	 * @param event (optional) The event handler to call when the button is
	 *              clicked.
	 * @param hide  (optional) Whether clicking this button will automatically
	 *              hide the form. Defaults to true.
	 * @return this
	 */
	button(text, event, hide = true) {
		// Create our button with its default close behavior.
		let button = $("<button>")
			.text(text)

		// Add the event handler to hide the form if necessary.
		if (hide) {
			button.on("click", e => {
				this.hide()
			});
		}

		// If we have a user event, bind it as well.
		if (event) {
			button.on("click", event);
		}

		// Add the button to the button area.
		this.buttons.append(button);
		return this;
	}

	/**
	 * Adds a button in the same way as button(), but as a default, OK, or Yes
	 * button.
	 *
	 * @param text The text to put on the button. Defaults to "OK".
	 * @param event (optional) The event handler to call when the button is
	 *              clicked.
	 * @param hide  (optional) Whether clicking this button will automatically
	 *              hide the form. Defaults to true.
	 * @return this
	 */
	accept(text = "OK", event, hide = true) {
		this.button(text, event, hide);
		return this;
	}

	/**
	 * Adds a button in the same way as button(), but as a Cancel or No button.
	 * Additionally, the event handler is also bound to the X button on
	 * non-blocking dialogs.
	 *
	 * @param text The text to put on the button. Defaults to "Cancel".
	 * @param event (optional) The event handler to call when this button or
	 *              the X button is clicked.
	 * @param hide  (optional) Whether clicking this button or the X button
	 *              will automatically hide the form. Defaults to true.
	 * @return this
	 */
	cancel(text = "Cancel", event, hide = true) {
		this.button(text, event, hide);

		this.hideOnClose = hide;
		if (event) {
			this.close.on("click", event);
		}

		return this;
	}

	/**
	 * Shows the dialog on the screen. The dialog will come with an X button,
	 * and the user may close the dialog with it. Does not move the dialog if
	 * it is already shown.
	 *
	 * @return this
	 */
	show() {
		this.header.append(this.close);

		if (this.dialog.parent().length == 0) {
			$("#dialog-bg").append(this.dialog);
		}

		return this;
	}

	/**
	 * Shows the dialog on the screen. The dialog will not have an X button,
	 * making it possible to have a dialog where the user must select a button
	 * or that the user cannot close at all. Does not move the dialog if it is
	 * already shown.
	 *
	 * @return this
	 */
	block() {
		this.close.detach();

		if (this.dialog.parent().length == 0) {
			$("#dialog-bg").append(this.dialog);
		}

		return this;
	}

	/**
	 * Hides this dialog from the screen. Does nothing if it is not currently
	 * shown.
	 *
	 * @return this
	 */
	hide() {
		this.dialog.detach();
		return this;
	}
}

/** The amount of time a transient message bar will stay on the screen before
 * hiding itself. Defined as ten seconds. */
var TRANSIENT_MESSAGE_TIME = 1000 * 10;

/**
 * Interface for creating non-modal message bars with text and buttons. This
 * class is very similar to the Dialog class, only having a few small
 * differences in methods and behaviour.
 */
class Message {
	/** Constructs a new blank message bar. */
	constructor() {
		this.message = $template("tem-message");

		this.content = this.message.find(".message-content");
		this.buttons = this.message.find(".message-buttons");

		// The timeout ID for transient messages.
		this.timeout = null;
	}

	/**
	 * Adds an element or a set of elements to the content area of the message.
	 *
	 * @param elems The element(s) to add.
	 * @return this
	 */
	add(elems) {
		this.content.append(elems);
		return this;
	}

	/**
	 * Adds plain text to the content area of the message.
	 *
	 * @param text The text to add.
	 * @return this
	 */
	text(text) {
		this.add($text(text));
		return this;
	}

	/**
	 * Clears all elements and text from the content area of the message,
	 * allowing new elements to be added. Buttons are unaffected.
	 *
	 * @return this
	 */
	clear() {
		this.content.empty();
		return this;
	}

	/**
	 * Adds a button to the button area of the message and optionally binds an
	 * event to it as well.
	 *
	 * @param text  The text to put on the button.
	 * @param event (optional) The event handler to call when the button is
	 *              clicked.
	 * @param hide  (optional) Whether clicking this button will automatically
	 *              hide the form. Defaults to true.
	 * @return this
	 */
	button(text, event, hide = true) {
		let button = $("<button>")
			.text(text)
			.addClass("special");

		if (hide) {
			button.on("click", e => {
				this.hide();
			});
		}

		if (event) {
			button.on("click", event);
		}

		this.buttons.append(button);
		return this;
	}

	/**
	 * Adds a button in the same way as button(), but as an X button.
	 *
	 * @param text The text to put on the button. Defaults to "X".
	 * @param event (optional) The event handler to call when this button or
	 *              the X button is clicked.
	 * @param hide  (optional) Whether clicking this button will automatically
	 *              hide the form. Defaults to true.
	 * @return this
	 */
	closer(text = "\xD7", event, hide = true) {
		this.button(text, event, hide);
		return this;
	}

	/**
	 * Shows the message bar on the screen. Does nothing if the message bar is
	 * already shown, but clears any transient status.
	 *
	 * @return this
	 */
	show() {
		this.clearTransient();

		// Only append ourselves if we don't currently have a parent.
		// Otherwise, we might change the position of the message.
		if (this.message.parent().length == 0) {
			$("#message-bg").append(this.message);
		}
		return this;
	}

	/**
	 * Shows a temporary message bar that will hide itself after a certain
	 * amount of time. If called multiple times while shown, the timeout
	 * counter is reset each time.
	 *
	 * @return this
	 */
	transient() {
		this.show();

		// After the proper time has elapsed, hide the message bar again.
		this.timeout = window.setTimeout(() => {
			this.hide();
		}, TRANSIENT_MESSAGE_TIME);

		return this;
	}

	/**
	 * Hides this message bar from the screen. Does nothing if it is not
	 * currently shown. Clears any current transient status.
	 *
	 * @return this
	 */
	hide() {
		this.message.detach();
		this.clearTransient();

		return this;
	}

	/**
	 * Internal method: If there is a transient timeout currently set, clears
	 * and unsets the timeout so the message will no longer automatically hide
	 * itself.
	 *
	 * @return this
	 */
	clearTransient() {
		if (this.timeout !== null) {
			window.clearTimeout(this.timeout);
			this.timeout = null;
		}
	}
}

/**
 * Creates a controller for a set of tabs defined by HTML attributes.
 *
 * Tabs are defined by two things: a tab list ID and a tab ID, defined in the
 * HTML as attributes "data-tablist", defined on parent container elements, and
 * "data-tab", defined on the direct children of those containers.
 *
 * When a "data-tab" element is currently shown, this will be indicated with
 * the "data-shown" attribute. The tab controller will not actually perform the
 * hiding and showing of each tab; it's up to the CSS to do this, allowing more
 * flexibility and complex tab structures.
 *
 * For example, the following HTML is a set of tab buttons followed by a set of
 * paragraphs to be shown when those buttons are selected. Tab 1 is currently
 * selected by a call to showTab():
 *
 *     <h3>Here are the tab buttons</h3>
 *     <div data-tablist="my-tabs">
 *         <button data-tab="tab-1" data-shown>Tab 1</button>
 *         <button data-tab="tab-2">Tab 2</button>
 *     </div>
 *
 *     <h3>And here are the paragraphs:</h3>
 *     <div data-tablist="my-tabs">
 *         <p data-tab="tab-1">This is shown when tab 1 is selected.</p>
 *         <p data-tab="tab-2">This is shown when tab 2 is selected.</p>
 *     </div>
 *
 * As in the Dialog class, methods can be chained.
 */
class TabList {
	/**
	 * Creates a new tab controller for tab elements that have the specified
	 * tablist ID.
	 *
	 * @param tabList     The tabList ID of the tabs to control.
	 * @param bindButtons (optional) If true, searches for all direct tab
	 *                    children of a tablist that are buttons with the
	 *                    "data-tab" attribute and binds an event listener to
	 *                    them such that, when they are clicked, their
	 *                    corresponding tab will open.
	 */
	constructor(tabList, bindButtons = true) {
		this.tabList = tabList;
		this.listElems = $(`[data-tablist="${tabList}"]`);

		if (bindButtons) {
			// Make our event handler to be called for each button.
			let handler = e => {
				// Open the tab specified by the button.
				let tab = $(e.target).attr("data-tab");
				this.showTab(tab);
			};

			// Bind this event listener to all the buttons.
			this.listElems.find("> button[data-tab]").on("click", handler);
			return this;
		}
	}

	/**
	 * Opens a tab with the specified tab ID. All other tabs in the tablist
	 * will be closed.
	 *
	 * @param tab The tab ID of the tab to open.
	 * @return this
	 */
	showTab(tab) {
		this.hideTabs();
		this.listElems.find(`> [data-tab="${tab}"]`).attr("data-shown", true);
		return this;
	}

	/**
	 * Closes all tabs in the tablist programmatically.
	 *
	 * @return this
	 */
	hideTabs() {
		this.listElems.find("> *").removeAttr("data-shown");
		return this;
	}
}
