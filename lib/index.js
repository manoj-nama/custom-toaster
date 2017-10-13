'use strict';

(function (window, document, undefined) {
  var instance;
  function Toaster(options, rootEl) {
    var TYPES = {
      'INFO': 'info',
      'SUCCESS': 'success',
      'WARNING': 'warning',
      'ERROR': 'error'
    };
    var defaultOptions = {
      duration: 5000,
      onDismiss: function () { }
    };
    var stack = [];

    options = Object.assign({}, defaultOptions, options);

    var show = function (type, message, title, code) {
      return pushItem(type, message, title, options.duration, code);
    }

    var generateToast = function (data, index) {
      var el = document.createElement('div');
      var titleEl = document.createElement('div');
      var messageEl = document.createElement('div');
      var detailsEl = document.createElement('div');
      var actionEl = document.createElement('div');
      var btn = document.createElement('a');

      el.classList = "toastr-wrapper push toastr-" + data.type;

      titleEl.innerText = data.title || "";
      messageEl.innerText = data.message || "";
      titleEl.classList = "toastr-title";
      messageEl.classList = "toastr-message";
      detailsEl.classList = "toastr-details";
      actionEl.classList = "toastr-action";

      btn.href = '#';
      btn.innerText = "hide";
      btn.classList = "action";
      btn.addEventListener('click', function (evt) {
        evt.preventDefault();
        if (options.onDismiss) {
          options.onDismiss(stack[index]);
        }
        removeToast(index);
      }, false);

      if (data.title) {
        detailsEl.appendChild(titleEl);
      }
      if (data.message) {
        detailsEl.appendChild(messageEl);
      }

      actionEl.appendChild(btn);

      el.appendChild(detailsEl);
      el.appendChild(actionEl);

      rootEl.prepend(el);
      return el;
    }

    var updateToastWithDuplicates = function (item) {
      var badgeEl = item.element.querySelector('.badge');
      if (!badgeEl) {
        badgeEl = document.createElement('div');
        badgeEl.classList = "toastr-badge";
        badgeEl.innerText = item.clubbed.length + 1;
        item.element.appendChild(badgeEl);
      } else {
        badgeEl.innerText = item.clubbed.length + 1;
      }
      // console.log(item);
    }

    var pushItem = function (type, message, title, duration, code) {
      var duplicateIndex = -1,
        data = { title: title, message: message, type: type, timer: timer, code: code },
        timer,
        el;

      stack.forEach(function (item, idx) {
        if (item.code === code && duplicateIndex === -1) {
          // club these items in one
          stack[idx].clubbed = stack[idx].clubbed || [];
          stack[idx].clubbed.push(data);
          stack[idx].element.classList.add("multiple");
          duplicateIndex = idx;
        }
      });

      if (duplicateIndex !== -1) {
        updateToastWithDuplicates(stack[duplicateIndex]);
        return;
      }

      timer = initiateTimer(stack.length, duration);
      el = generateToast(data, stack.length);
      data.element = el;
      stack.push(data);
    }

    var removeToast = function (index) {
      var poppedItem;
      if (typeof index !== "undefined") {
        poppedItem = stack[index];
        stack.splice(index, 1);
      } else {
        poppedItem = stack.shift();
      }
      poppedItem.element.classList.remove('push');
      poppedItem.element.classList.add('pop');

      poppedItem.element.addEventListener('animationend', function () {
        poppedItem.element.remove();
      }, false);
    }

    var initiateTimer = function (index, duration) {
      return setTimeout(function (index) {
        removeToast();
      }, duration, index);
    }

    this.info = function (message, title, code) {
      return show(TYPES.INFO, message, title, code || title);
    };

    this.success = function (message, title, code) {
      return show(TYPES.SUCCESS, message, title, code || title);
    };

    this.error = function (message, title, code) {
      return show(TYPES.ERROR, message, title, code || title);
    };

    this.warning = function (message, title, code) {
      return show(TYPES.WARNING, message, title, code || title);
    };
  }

  Toaster.init = function (options) {
    var rootEl;
    if (!instance) {
      rootEl = document.createElement('div');
      rootEl.classList = "toastr-container";
      document.body.appendChild(rootEl);
      instance = new Toaster(options, rootEl);
    }
    return instance;
  };

  window.Toaster = Toaster;
})(window, document);