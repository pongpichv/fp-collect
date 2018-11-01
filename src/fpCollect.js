const fpCollect = (function () {
  const UNKNOWN = 'unknown';
  const ERROR = 'error';

  const DEFAULT_ATTRIBUTES_ASYNC = {
    plugins: false,
    mimeTypes: false,
    userAgent: false,
    platform: false,
    languages: false,
    screen: false,
    touchScreen: false,
    videoCard: false,
    multimediaDevices: true,
    productSub: false,
    navigatorPrototype: false,
    etsl: false,
    screenDesc: false,
    phantomJS: false,
    nightmareJS: false,
    selenium: false,
    webDriver: false,
    errorsGenerated: false,
    resOverflow: false,
    accelerometerUsed: true,
    screenMediaQuery: false,
    hasChrome: false,
    permissions: true,
    iframeChrome: false,
    debugTool: false,
    battery: false,
    deviceMemory: false,
    tpCanvas: true,
    sequentum: false,
    audioCodecs: false,
    videoCodecs: false
  };

  const defaultAttributeToFunction = {
    userAgent: () => {
      return navigator.userAgent;
    },
    plugins: () => {
      const pluginsRes = [];
      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        const pluginStr = [plugin.name, plugin.description, plugin.filename, plugin.version].join("::");
        let mimeTypes = [];
        Object.keys(plugin).forEach((mt) => {
          mimeTypes.push([plugin[mt].type, plugin[mt].suffixes, plugin[mt].description].join("~"));
        });
        mimeTypes = mimeTypes.join(",");
        pluginsRes.push(pluginStr + "__" + mimeTypes);
      }
      return pluginsRes;
    },
    mimeTypes: () => {
      const mimeTypes = [];
      for (let i = 0; i < navigator.mimeTypes.length; i++) {
        let mt = navigator.mimeTypes[i];
        mimeTypes.push([mt.description, mt.type, mt.suffixes].join("~~"));
      }
      return mimeTypes;
    },
    platform: () => {
      if (navigator.platform) {
        return navigator.platform;
      }
      return UNKNOWN;
    },
    languages: () => {
      if (navigator.languages) {
        return navigator.languages;
      }
      return UNKNOWN;
    },
    screen: () => {
      return {
        wInnerHeight: window.innerHeight,
        wOuterHeight: window.outerHeight
      };
    },
    touchScreen: () => {
      let maxTouchPoints = 0;
      let touchEvent = false;
      if (typeof navigator.maxTouchPoints !== "undefined") {
        maxTouchPoints = navigator.maxTouchPoints;
      } else if (typeof navigator.msMaxTouchPoints !== "undefined") {
        maxTouchPoints = navigator.msMaxTouchPoints;
      }
      try {
        document.createEvent("TouchEvent");
        touchEvent = true;
      } catch (_) {
      }

      const touchStart = "ontouchstart" in window;
      return [maxTouchPoints, touchEvent, touchStart];
    },
    videoCard: () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        let webGLVendor, webGLRenderer;
        if (ctx.getSupportedExtensions().indexOf("WEBGL_debug_renderer_info") >= 0) {
          webGLVendor = ctx.getParameter(ctx.getExtension('WEBGL_debug_renderer_info').UNMASKED_VENDOR_WEBGL);
          webGLRenderer = ctx.getParameter(ctx.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
        } else {
          webGLVendor = "Not supported";
          webGLRenderer = "Not supported";
        }
        return [webGLVendor, webGLRenderer];
      } catch (e) {
        return "Not supported;;;Not supported";
      }
    },
    multimediaDevices: () => {
      return new Promise((resolve) => {
        const deviceToCount = {
          "audiooutput": 0,
          "audioinput": 0,
          "videoinput": 0
        };

        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
          && navigator.mediaDevices.enumerateDevices.name !== "bound reportBlock") {
          // bound reportBlock occurs with Brave
          navigator.mediaDevices.enumerateDevices().then((devices) => {
            let name;
            for (let i = 0; i < devices.length; i++) {
              name = [devices[i].kind];
              deviceToCount[name] = deviceToCount[name] + 1;
            }
            resolve({
              speakers: deviceToCount.audiooutput,
              micros: deviceToCount.audioinput,
              webcams: deviceToCount.videoinput
            });
          });
        } else if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
          && navigator.mediaDevices.enumerateDevices.name === "bound reportBlock") {
          resolve({
            'devicesBlockedByBrave': true
          });
        } else {
          resolve({
            speakers: 0,
            micros: 0,
            webcams: 0
          });
        }
      });
    },
    productSub: () => {
      return navigator.productSub;
    },
    navigatorPrototype: () => {
      let obj = window.navigator;
      const protoNavigator = [];
      do Object.getOwnPropertyNames(obj).forEach((name) => {
        protoNavigator.push(name);
      });
      while (obj = Object.getPrototypeOf(obj));

      let res;
      const finalProto = [];
      protoNavigator.forEach((prop) => {
        const objDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(navigator), prop);
        if (objDesc !== undefined) {
          if (objDesc.value !== undefined) {
            res = objDesc.value.toString();
          } else if (objDesc.get !== undefined) {
            res = objDesc.get.toString();
          }
        }
        else {
          res = "";
        }
        finalProto.push(prop + "~~~" + res);
      });
      return finalProto;
    },
    etsl: () => {
      return eval.toString().length;
    },
    screenDesc: () => {
      try {
        return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(screen), "width").get.toString();
      } catch (e) {
        return ERROR;
      }
    },
    nightmareJS: () => {
      return !!window.__nightmare;
    },
    phantomJS: () => {
      return [
        'callPhantom' in window,
        '_phantom' in window,
        'phantom' in window
      ];
    },
    selenium: () => {
      return [
        'webdriver' in window,
        '_Selenium_IDE_Recorder' in window,
        'callSelenium' in window,
        '_selenium' in window,
        '__webdriver_script_fn' in document,
        '__driver_evaluate' in document,
        '__webdriver_evaluate' in document,
        '__selenium_evaluate' in document,
        '__fxdriver_evaluate' in document,
        '__driver_unwrapped' in document,
        '__webdriver_unwrapped' in document,
        '__selenium_unwrapped' in document,
        '__fxdriver_unwrapped' in document,
        '__webdriver_script_func' in document,
        document.documentElement.getAttribute("selenium") !== null,
        document.documentElement.getAttribute("webdriver") !== null,
        document.documentElement.getAttribute("driver") !== null
      ];
    },
    webDriver: () => {
        return 'webdriver' in navigator;
    },
    errorsGenerated: () => {
      const errors = [];
      try {
        azeaze + 3;
      } catch (e) {
        errors.push(e.message);
        errors.push(e.fileName);
        errors.push(e.lineNumber);
        errors.push(e.description);
        errors.push(e.number);
        errors.push(e.columnNumber);
        try {
          errors.push(e.toSource().toString());
        } catch (e) {
          errors.push(undefined);
        }
      }

      try {
        new WebSocket('itsgonnafail');
      } catch (e) {
        errors.push(e.message);
      }
      return errors;
    },
    resOverflow: () => {
      let depth = 0;
      let errorMessage = '';
      let errorName = '';
      let errorStacklength = 0;

      function iWillBetrayYouWithMyLongName() {
        try {
          depth++;
          iWillBetrayYouWithMyLongName();
        } catch (e) {
          errorMessage = e.message;
          errorName = e.name;
          errorStacklength = e.stack.toString().length;
        }
      }

      iWillBetrayYouWithMyLongName();
      return {
        depth: depth,
        errorMessage: errorMessage,
        errorName: errorName,
        errorStacklength: errorStacklength
      }

    },
    accelerometerUsed: () => {
      return new Promise((resolve) => {
        window.ondevicemotion = event => {
          if (event.accelerationIncludingGravity.x !== null) {
            return resolve(true);
          }
        };

        setTimeout(() => {
          return resolve(false);
        }, 200);
      });
    },
    screenMediaQuery: () => {
      return window.matchMedia('(min-width: '+(screen.availWidth-1)+'px)').matches;
    },
    hasChrome: () => {
      return !!window.chrome;
    },
    permissions: () => {
      return new Promise((resolve) => {
        navigator.permissions.query({name: 'notifications'}).then((val) => {
          resolve({
            state: val.state,
            permission: Notification.permission
          })
        });
      })
    },
    iframeChrome: () => {
      const iframe = document.createElement('iframe');
      iframe.srcdoc = 'blank page';
      document.body.appendChild(iframe);

      const result = typeof iframe.contentWindow.chrome;
      iframe.remove();

      return result;
    },
    debugTool: () => {
      let cpt = 0;
      const regexp = /./;
      regexp.toString = () => {
        cpt++;
        return 'spooky';
      };
      console.debug(regexp);
      return cpt > 1;
    },
    battery: () => {
      return 'getBattery' in window.navigator;
    },
    deviceMemory: () => {
      return navigator.deviceMemory || 0;
    },
    tpCanvas: () => {
      return new Promise((resolve) => {
        try {
          const img = new Image();
          const canvasCtx = document.createElement('canvas').getContext('2d');
          img.onload = () => {
            canvasCtx.drawImage(img, 0, 0);
            resolve(canvasCtx.getImageData(0, 0, 1, 1).data);
          };

          img.onerror = () => {
            resolve(ERROR);
          };
          img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';
        } catch (e) {
          resolve(ERROR);
        }
      });
    },
    sequentum: () => {
      return window.external && window.external.toString && window.external.toString().indexOf('Sequentum') > -1;
    },
    audioCodecs: () => {
      const audioElt = document.createElement("audio");

      if (audioElt.canPlayType) {
        return {
          ogg: audioElt.canPlayType('audio/ogg; codecs="vorbis"'),
          mp3: audioElt.canPlayType('audio/mpeg;'),
          wav: audioElt.canPlayType('audio/wav; codecs="1"'),
          m4a: audioElt.canPlayType('audio/x-m4a;'),
          aac: audioElt.canPlayType('audio/aac;'),
        }
      }
      return {
        ogg: UNKNOWN,
        mp3: UNKNOWN,
        wav: UNKNOWN,
        m4a: UNKNOWN,
        aac: UNKNOWN
      };
    },
    videoCodecs: () => {
      const videoElt = document.createElement("video");

      if (videoElt.canPlayType) {
        return {
          ogg: videoElt.canPlayType('video/ogg; codecs="theora"'),
          h264: videoElt.canPlayType('video/mp4; codecs="avc1.42E01E"'),
          webm: videoElt.canPlayType('video/webm; codecs="vp8, vorbis"'),
        }
      }
      return {
        ogg: UNKNOWN,
        h264: UNKNOWN,
        webm: UNKNOWN,
      }
    }
  };

  const addCustomFunction = function (category, name, options, f) {
    DEFAULT_OPTIONS[category][name] = options;
    defaultAttributeToFunction[category][name] = f;
  };

  const generateFingerprint = function () {
    return new Promise((resolve) => {
      const promises = [];
      const fingerprint = {};
      Object.keys(DEFAULT_ATTRIBUTES_ASYNC).forEach((attribute) => {
        console.log(attribute);
        fingerprint[attribute] = {};
        if (DEFAULT_ATTRIBUTES_ASYNC[attribute]) {
          promises.push(new Promise((resolve) => {
            defaultAttributeToFunction[attribute]().then((val) => {
              fingerprint[attribute] = val;
              return resolve();
            });
          }));
        } else {
          fingerprint[attribute] = defaultAttributeToFunction[attribute]();
        }
      });
      return Promise.all(promises).then(() => {
        return resolve(fingerprint);
      });
    });
  };

  return {
    addCustomFunction: addCustomFunction,
    generateFingerprint: generateFingerprint,
  };

})();

module.exports = fpCollect;