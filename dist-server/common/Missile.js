"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lanceGg = require("lance-gg");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } Object.defineProperty(subClass, "prototype", { value: Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }), writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Missile = /*#__PURE__*/function (_DynamicObject) {
  _inherits(Missile, _DynamicObject);

  var _super = _createSuper(Missile);

  function Missile(gameEngine, options, props) {
    _classCallCheck(this, Missile);

    return _super.call(this, gameEngine, options, props);
  } // this is what allows usage of shadow object with input-created objects (missiles)
  // see https://medium.com/javascript-multiplayer-gamedev/chronicles-of-the-development-of-a-multiplayer-game-part-2-loops-and-leaks-10b453e843e0
  // in the future this will probably be embodied in a component


  _createClass(Missile, [{
    key: "bending",
    get: // position correction if less than world width/height
    function get() {
      return {
        position: {
          max: 500.0
        }
      };
    }
  }, {
    key: "onAddToWorld",
    value: function onAddToWorld(gameEngine) {
      if (_lanceGg.Renderer) {
        var renderer = _lanceGg.Renderer.getInstance();

        var sprite = new PIXI.Sprite(PIXI.loader.resources.missile.texture);
        renderer.sprites[this.id] = sprite;
        sprite.width = 81 * 0.5;
        sprite.height = 46 * 0.5;
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(this.position.x, this.position.y);
        renderer.layer2.addChild(sprite);
      }
    }
  }, {
    key: "onRemoveFromWorld",
    value: function onRemoveFromWorld(gameEngine) {
      if (_lanceGg.Renderer) {
        var renderer = _lanceGg.Renderer.getInstance();

        if (renderer.sprites[this.id]) {
          renderer.sprites[this.id].destroy();
          delete renderer.sprites[this.id];
        }
      }
    }
  }, {
    key: "syncTo",
    value: function syncTo(other) {
      _get(_getPrototypeOf(Missile.prototype), "syncTo", this).call(this, other);

      this.inputId = other.inputId;
    }
  }], [{
    key: "netScheme",
    get: function get() {
      return Object.assign({
        inputId: {
          type: _lanceGg.BaseTypes.TYPES.INT32
        }
      }, _get(_getPrototypeOf(Missile), "netScheme", this));
    }
  }]);

  return Missile;
}(_lanceGg.DynamicObject);

exports["default"] = Missile;
//# sourceMappingURL=Missile.js.map