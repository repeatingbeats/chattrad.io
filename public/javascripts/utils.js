var Chattradio = Chattradio || {};

// Add the function properties of module to the receiver object
Chattradio.mixin = function (receiver, module) {

  for (var method in module) {
    if (module.hasOwnProperty(method) && typeof module[method] === 'function') {
      receiver[method] = module[method];
    }
  }

};

// Custom event bindings
Chattradio.events = {

  bind: function (type, callback) {
    this._listeners = this._listeners || {};
    this._listeners[type] = this._listeners[type] || [];
    this._listeners[type].push(callback);
  },

  unbind: function (type, callback) {
    var index,
        listeners;

    this._listeners = this._listeners || {};
    listeners = this._listeners;
    if (type in listeners) {
      index = listeners[type].indexOf(callback);
      if (index >= 0) {
        listeners[type].splice(index, 1);
      }
    }
  },

  trigger: function (type) {
    var slice = Array.prototype.slice,
        listeners,
        typeListeners,
        i,
        len;
    this._listeners = this._listeners || {};
    listeners = this._listeners;
    if (type in listeners) {
      typeListeners = listeners[type];
      for (i = 0, len = typeListeners.length; i < len; i++) {
        typeListeners[i].apply(this, slice.call(arguments, 1));
      }
    }
  }
};

Chattradio.rdioswf = null;
