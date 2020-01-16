const stackexchange = require('stackexchange');
const fs = require('fs');
const {promisify} = require('util');

const context = new stackexchange({ version: 2.2 });

const config = require("./config.json");

// Group tags by WG? by specs?

const stackoverflow_filters = {
  'https://w3c.github.io/mediacapture-main/': {
    type: 'javascript',
    tags: ['mediadevices', 'getusermedia', 'mediastream']
  },
  'https://w3c.github.io/mediacapture-screen-share/': {
    type: 'javascript',
    tags: ['get-display-media', 'screen-capture', 'screensharing']
  },
  'https://w3c.github.io/mediacapture-record/': {
    type: 'javascript',
    tags: ['web-mediarecorder']
  },
  'https://w3c.github.io/webrtc-pc/': {
    type: 'javascript',
    tags: ['webrtc', 'rtcdatachannel', 'rtcpeerconnection']
  },
  'https://w3c.github.io/webrtc-stats/': {
    type: 'webrtc',
    tags: ['statistics'],
    keywords: ['getStat', 'getStats']
  },
  'https://w3c.github.io/webrtc-svc/': {
    type: 'webrtc',
    tags: ['svc']
  },
  'https://w3c.github.io/mediacapture-output/': {
    keywords: ['setSinkId']
  },
  'https://w3c.github.io/mediacapture-fromelement/': {
    type: 'javascript',
    keywords: ['captureStream', 'requestFrame'] // ambiguity with requestAnimationFrame
  },
  'https://webaudio.github.io/web-audio-api/': {
    type: 'javascript',
    tags: ['web-audio-api']
  },
  'http://webaudio.github.io/web-midi-api/': {
    tags: ['web-midi']
  },
  'https://immersive-web.github.io/webxr/': {
    tags: ['webxr']
  },
  'https://w3c.github.io/ServiceWorker/v1/': {
    tags: ['service-worker']
  },
  'https://w3c.github.io/payment-request/': {
    tags: ['payment-request-api']
  },
  'https://w3c.github.io/payment-handler/': {
    type: 'javascript',
    keywords: ['payment handler', 'paymentManager']
  },
  'https://w3c.github.io/payment-method-manifest/': {
    keywords: ['payment-method-manifest']
  },
  'https://w3c.github.io/webauthn/': {
    tags: ['webauthn']
  },
  'https://w3c.github.io/did-core/': {
    tags: ['decentralized-identity']
  },
  'https://w3c.github.io/FileAPI/': {
    type: 'javascript',
    tags: ['filereader']
  },
  'https://w3c.github.io/wcag/guidelines/': {
    tags: ['wcag']
  },
  'https://w3c.github.io/aria/': {
    tags: ['wai-aria']
  },
  'https://w3c.github.io/webdriver/': {
    tags: ['webdriver']
  },
  'https://w3c.github.io/sensors/': {
    type: 'javascript',
    tags: ['sensors'],
    keywords: ["generic sensor"]
  },
  'https://w3c.github.io/deviceorientation/': {
    type: 'javascript',
    tags: ['orientation', 'devicemotion'],
    keywords: ["deviceorientation", "deviceorientationevent", "devicemotionevent", "device orientation"]
  },
  'https://w3c.github.io/accelerometer/': {
    type: 'javascript',
    tags: ['accelerometer']
  },
  'https://w3c.github.io/magnetometer/': {
    type: 'javascript',
    tags: ['magnetometer']
  },
  'https://w3c.github.io/orientation-sensor/': {
    type: 'javascript',
    keywords: ['AbsoluteOrientationSensor', 'OrientationSensor']
  },
  'https://w3c.github.io/ambient-light/': {

  },
  'https://w3c.github.io/proximity/': {

  },
  'https://w3c.github.io/geolocation-sensor/': {
  },
  'https://w3c.github.io/battery/': {

  },
  'https://w3c.github.io/wake-lock/': {
  },
  'https://w3c.github.io/geolocation-api/': {
    type: 'javascript',
    tags: ['geolocation'],
  },
  'https://w3c.github.io/vibration/': {
    type: 'javascript',
    tags: ['vibration'],
    keywords: ['navigator.vibrate']
  },
  'https://w3c.github.io/trace-context/': {
    keywords: ['traceparent', 'tracestate']
  },
  'https://w3c.github.io/json-ld-syntax/': {
    tags: ['json-ld']
  },
  'https://w3c.github.io/encrypted-media/': {
    tags: ['eme']
  },
  'https://w3c.github.io/media-source/': {
    tags: ['media-source']
  },
  'https://w3c.github.io/picture-in-picture/': {
    type: 'javascript',
    tags: ['picture-in-picture'],
    keywords: ['enterpictureinpicture', 'leavepictureinpicture', 'exitPictureInPicture()', 'requestPictureInPicture', 'pictureInPictureElement']
  },
  'https://w3c.github.io/media-capabilities/': {
    type: 'javascript',
    keywords: ['mediaCapabilities', 'decodingInfo', 'encodingInfo']
  },
  'https://w3c.github.io/media-playback-quality/': {
    type: 'javascript',
    keywords: ['getVideoPlaybackQuality']
  },
  'https://w3c.github.io/mediasession/': {
    type: 'javascript',
    tags: ['mediasession'],
    keywords: ['mediaSession']
  },
  'https://w3c.github.io/pointerevents/': {
    type: 'javascript',
    tags: ['pointer-events'],
    keywords: ['PointerEvent', 'pointercancel', 'pointerdown', 'pointermove', 'pointerover']
  },
  'https://w3c.github.io/pub-manifest/': {
  },
  'https://w3c.github.io/audiobooks/': {
  },
  'https://w3c.github.io/presentation-api/': {
    type: 'javascript',
    keywords: ['PresentationRequest'],
  },
  'https://w3c.github.io/remote-playback/': {
    type: 'javascript',
    keywords: ['watchAvailability'] // no result...
  },
  'https://svgwg.org/svg2-draft/': {
    keywords: ['svg']
  },
  'https://w3c.github.io/webvtt/': {
    tags: ['webvtt']
  },
  'https://w3c.github.io/ttml1/': {
    tags: ['ttml'],
    keywords: ['ttml']
  },
  'https://w3c.github.io/vc-data-model/': {
    keywords: ['verifiable credential', 'verifiable claim']
  },
  'https://w3c.github.io/webappsec-csp/': {
    tags: ['content-security-policy']
  },
  'https://w3c.github.io/webappsec-subresource-integrity/': {
    tags: ['subresource-integrity']
  },
  'https://w3c.github.io/webappsec-mixed-content/': {
    tags: ['mixed-content']
  },
  'https://w3c.github.io/webappsec-secure-contexts/': {
    keywords: ['isSecureContext']
  },
  'https://w3c.github.io/webappsec-upgrade-insecure-requests/': {
    tags: ['upgrade-insecure-requests'],
    keywords: ['upgrade-insecure-requests']
  },
  'https://w3c.github.io/webappsec-credential-management/': {
    keywords: ['navigator.credentials']
  },
  'https://w3c.github.io/webappsec-clear-site-data/': {
    keywords: ['clear-site-data']
  },
  'https://w3c.github.io/permissions/': {
    keywords: ['navigator.permissions']
  },
  'https://w3c.github.io/woff/woff2/': {
    tags: ['woff']
  },
  'https://webassembly.github.io/spec/core/bikeshed/': {
    tags: ['webassembly']
  },
  'https://webassembly.github.io/spec/web-api/': {
    keywords: ['compileStreaming', 'instantiateStreaming']
  },
  'https://webassembly.github.io/spec/js-api/': {
    keywords: ['WebAssembly.instantiate']
  },
  'https://w3c.github.io/longtasks/': {
    keywords: [['PerformanceObserver','longtask']]
  },
  'https://w3c.github.io/paint-timing/': {
    keywords: [['PerformanceObserver','first-paint'], ['PerformanceObserver','first-contentful-paint']]
  },
  'https://w3c.github.io/page-visibility/': {
    keywords: ['visibilityState', 'visibilitychange']
  },
  'https://w3c.github.io/requestidlecallback/': {
    tags: ['requestidlecallback'],
    keywords: ['requestIdleCallback']
  },
  // FIXME upgrade to @w3c?
  'https://wicg.github.io/frame-timing/': {
    keywords: [['PerformanceObserver','frame']]
  },
  'https://w3c.github.io/network-error-logging/': {
    keywords: ["network error logging"]
  },
  'https://w3c.github.io/beacon/': {
    tags: ['sendbeacon'],
    keywords: ['sendBeacon']
  },
  'https://w3c.github.io/resource-timing/': {
    keywords: [['performance.getEntriesByType', 'resource']]
  },
  'https://w3c.github.io/device-memory/': {
    keywords: ['navigator.deviceMemory']
  },
  'https://w3c.github.io/user-timing/': {
    keywords: ['performance.mark', 'performance.measure', ['performance.getEntriesByType', 'mark']]
  },
  'https://w3c.github.io/reporting/': {
    keywords: ['ReportingObserver', ['Report-To', 'endpoints']]
  },
  'https://w3c.github.io/preload/': {
    keywords: [['link', 'preload']]
  },
  'https://w3c.github.io/server-timing/': {
    keywords: ['serverTiming']
  },
  'https://w3c.github.io/resource-hints/': {
    keywords: [['link', 'preconnect'],['link', 'prefetch'],['link', 'prerender'],['link', 'dns-prefetch']]
  },
  'https://w3c.github.io/hr-time/': {
    keywords: ['performance.now', 'performance.timeOrigin']
  },
  'https://w3c.github.io/performance-timeline/': {
    keywords: ['PerformanceObserver']
  },
  'https://w3c.github.io/navigation-timing/': {
    keywords: [['performance.getEntriesByType', 'navigation']]
  }
  // WebApps
  // @@@ CSS
};

const filter = {
  key: config.stackexchange.key,
  pagesize: 100,
  sort: 'activity',
  order: 'desc',
  site: 'stackoverflow'
};

const data = {};

async function collectData() {
  for (let spec of Object.keys(stackoverflow_filters)) {
    data[spec] = {tags:{}};
    const tags = stackoverflow_filters[spec].tags || [];
    for (let tag of tags) {
      data[spec].tags[tag] = {};
      const res = await promisify(context.questions.questions)
      ({...filter,
        tagged: tag + (stackoverflow_filters[spec].type ? ';' + stackoverflow_filters[spec].type : ''),
        filter: '!9Z(-x-Q)8' // includes total of questions
       });
      data[spec].tags[tag].type = stackoverflow_filters[spec].type;
      data[spec].tags[tag].total = res.total;
      data[spec].tags[tag].questions = res.items;
    }
    if (tags.length) {
      const res = await new Promise(
        (res, rej) => context.tags.wiki({...filter
                                         , filter: '!--fG1eTpRU.A' // includes full body of wiki
                                                                                                                        }, function(err, results) {
                                                                                                                          if (err) return rej(err);
                                                                                                                          res(results)
                                                                                                                        }, tags));
      res.items.forEach(
        i => data[spec].tags[i.tag_name].wiki = i
      );
    }
  }
}

collectData().then(() =>
                   fs.writeFileSync('results.json', JSON.stringify(data, null, 2)));
