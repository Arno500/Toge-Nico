"use strict";

require("./nico.css");
require("./nico-i18n");

/**
 * Nico button
 *
 * This feature creates a loop button in the control bar to toggle its behavior. It will restart media once finished
 * if activated
 */

// Translations (English required)
mejs.i18n.en["mejs.nico"] = "Toggle comments on video";

// Feature configuration
Object.assign(mejs.MepDefaults, {
  /**
   * @type {?String}
   */
  nicoText: null
});

Object.assign(MediaElementPlayer.prototype, {
  /**
   * Feature constructor.
   *
   * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
   * @param {MediaElementPlayer} player
   */
  buildnico(player) {
    const t = this,
      nicoTitle = mejs.Utils.isString(t.options.nicoText)
        ? t.options.nicoText
        : mejs.i18n.t("mejs.nico"),
      nico = document.createElement("div");

    nico.className = `${t.options.classPrefix}button ${
      t.options.classPrefix
    }nico-button ${`${t.options.classPrefix}nico-on`}`;
    nico.innerHTML = `<button type="button" aria-controls="${
      t.id
    }" title="${nicoTitle}" aria-label="${nicoTitle}" tabindex="0"></button>`;

    t.addControlElement(nico, "nico");
    player.options.nico = true;

    // add a click toggle event
    nico.addEventListener("click", () => {
      player.options.nico = !player.options.nico;
      const event = mejs.Utils.createEvent("nico", t.media);
      t.media.dispatchEvent(event);
      if (player.options.nico) {
        mejs.Utils.removeClass(nico, `${t.options.classPrefix}nico-off`);
        mejs.Utils.addClass(nico, `${t.options.classPrefix}nico-on`);
      } else {
        mejs.Utils.removeClass(nico, `${t.options.classPrefix}nico-on`);
        mejs.Utils.addClass(nico, `${t.options.classPrefix}nico-off`);
      }
    });
  }
});
