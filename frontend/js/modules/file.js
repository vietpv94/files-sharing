'use strict';

angular.module('dsp.file', ['angularFileUpload', 'dsp.http'])

  .constant('FILES_API_URL', '/api/files')
  .constant('DEFAULT_FILE_TYPE', 'application/octet-stream')

  .factory('fileUploadService', function($q, $timeout, $log, fileAPIService, FILES_API_URL, DEFAULT_FILE_TYPE) {

    function get(uploader) {
      var date = Date.now();
      var tracker = [];
      var processed = 0;
      var tasks = [];
      var background = false;

      function progress() {
        return parseInt(100.0 * processed / tasks.length, 10);
      }

      function isComplete() {
        return processed === tasks.length;
      }

      function await(done, error, progress) {
        done = done || function(result) {
            $log.debug('Tasks are complete:', result);
          };

        error = error || function(err) {
            $log.debug('Error while processing tasks:', err);
          };

        progress = progress || function(evt) {
            $log.debug('Tasks progress:', evt);
          };

        return $q.all(tracker).then(done, error, progress);
      }

      function addFile(file, start) {
        if (!file) {
          return;
        }

        var done = function(result) {
          processed++;
          return result;
        };

        var fail = function(err) {
          processed++;
          return err;
        };

        var canceler = $q.defer();
        var defer = $q.defer();
        tracker.push(defer.promise.then(done, fail));
        var task = {
          uploading: false,
          progress: 0,
          file: file,
          defer: defer,
          canceler: canceler,
          cancel: function() {
            canceler.resolve();
          }
        };
        tasks.push(task);
        if (start) {
          upload(task);
        }
        return task;
      }

      function upload(task) {
        if (!task) {
          return;
        }

        task.uploading = true;
        task.progress = 0;

        task.uploader = (uploader || fileAPIService).uploadFile(FILES_API_URL, task.file, task.file.type || DEFAULT_FILE_TYPE, task.file.size, {}, task.canceler.promise)
          .then(function(response) {
            task.progress = 100;
            task.uploaded = true;
            task.response = response;

            return task.defer.resolve(task);
          }, task.defer.reject, function(evt) {
            task.progress = parseInt(100.0 * evt.loaded / evt.total, 10);

            return task.defer.notify(task);
          })
          .finally(function() {
            $timeout(function() {
              task.uploading = false;
            }, 1500);
          });

        return task.uploader;
      }

      function start() {
        angular.forEach(tasks, function(task) {
          upload(task);
        });
        return tasks;
      }

      return {
        await: await,
        addFile: addFile,
        isComplete: isComplete,
        start: start,
        background: background,
        progress: progress,
        date: date
      };
    }

    return {
      get: get
    };
  })
  .factory('fileAPIService', function($upload, dspRestangular) {
    function uploadBlob(url, blob, mime, size, canceler) {
      return $upload.http({
        method: 'POST',
        url: url,
        headers: {'Content-Type': mime},
        data: blob,
        params: {mimetype: mime, size: size},
        withCredentials: true,
        timeout: canceler
      });
    }

    function uploadFile(url, file, mime, size, options, canceler) {
      var params = {mimetype: mime, size: size, name: file.name};
      if (options) {
        angular.extend(params, options);
      }
      return $upload.upload({
        method: 'POST',
        url: url,
        file: file,
        params: params,
        withCredentials: true,
        timeout: canceler
      });
    }

    function remove(parameter, id) {
      return dspRestangular.one(parameter, id).remove();
    }

    return {
      uploadBlob: uploadBlob,
      uploadFile: uploadFile,
      remove: remove
    };
  })
  .factory('contentTypeService', function() {

    var extensions = {
      'application/x-rar-compressed': 'rar',
      'application/x-sh': 'sh',
      'application/x-shockwave-flash': 'swf',
      'application/x-sql': 'sql',
      'application/x-t3vm-image': 't3',
      'application/x-tar': 'tar',
      'application/x-tcl': 'tcl',
      'application/x-tex': 'tex',
      'application/x-wais-source': 'src',
      'application/xhtml+xml': 'xhtml',
      'application/xml': 'xml',
      'application/zip': 'zip',
      'audio/adpcm': 'adp',
      'audio/basic': 'au',
      'audio/midi': 'mid',
      'audio/mp4': 'mp4a',
      'audio/mpeg': 'mpga',
      'audio/ogg': 'oga',
      'audio/webm': 'weba',
      'audio/x-flac': 'flac',
      'audio/x-matroska': 'mka',
      'audio/x-mpegurl': 'm3u',
      'audio/x-ms-wax': 'wax',
      'audio/x-ms-wma': 'wma',
      'audio/x-wav': 'wav',
      'audio/xm': 'xm',
      'image/bmp': 'bmp',
      'image/cgm': 'cgm',
      'image/g3fax': 'g3',
      'image/gif': 'gif',
      'image/ief': 'ief',
      'image/jpeg': 'jpeg',
      'image/ktx': 'ktx',
      'image/png': 'png',
      'image/prs.btif': 'btif',
      'image/sgi': 'sgi',
      'image/svg+xml': 'svg',
      'image/tiff': 'tiff',
      'image/vnd.adobe.photoshop': 'psd',
      'image/vnd.dece.graphic': 'uvi',
      'image/vnd.dvb.subtitle': 'sub',
      'image/webp': 'webp',
      'image/x-icon': 'ico',
      'image/x-mrsid-image': 'sid',
      'image/x-pcx': 'pcx',
      'image/x-pict': 'pic',
      'image/x-rgb': 'rgb',
      'image/x-tga': 'tga',
      'image/x-xbitmap': 'xbm',
      'image/x-xpixmap': 'xpm',
      'image/x-xwindowdump': 'xwd',
      'message/rfc822': 'eml',
      'model/iges': 'igs',
      'model/mesh': 'msh',
      'model/vnd.collada+xml': 'dae',
      'model/vnd.dwf': 'dwf',
      'model/vnd.gdl': 'gdl',
      'model/vnd.gtw': 'gtw',
      'model/vnd.mts': 'mts',
      'model/vnd.vtu': 'vtu',
      'model/vrml': 'wrl',
      'model/x3d+binary': 'x3db',
      'model/x3d+vrml': 'x3dv',
      'model/x3d+xml': 'x3d',
      'text/cache-manifest': 'appcache',
      'text/calendar': 'ics',
      'text/css': 'css',
      'text/csv': 'csv',
      'text/html': 'html',
      'text/n3': 'n3',
      'text/plain': 'txt',
      'text/prs.lines.tag': 'dsc',
      'text/richtext': 'rtx',
      'text/tab-separated-values': 'tsv',
      'text/troff': 't',
      'text/turtle': 'ttl',
      'text/uri-list': 'uri',
      'text/vcard': 'vcard',
      'text/vnd.dvb.subtitle': 'sub',
      'text/vnd.in3d.3dml': '3dml',
      'text/vnd.in3d.spot': 'spot',
      'text/vnd.sun.j2me.app-descriptor': 'jad',
      'text/x-asm': 's',
      'text/x-c': 'c',
      'text/x-fortran': 'f',
      'text/x-java-source': 'java',
      'text/x-opml': 'opml',
      'text/x-pascal': 'p',
      'text/x-uuencode': 'uu',
      'text/x-vcalendar': 'vcs',
      'text/x-vcard': 'vcf',
      'text/xml': 'xml',
      'video/3gpp': '3gp',
      'video/3gpp2': '3g2',
      'video/h261': 'h261',
      'video/h263': 'h263',
      'video/h264': 'h264',
      'video/jpeg': 'jpgv',
      'video/jpm': 'jpm',
      'video/mj2': 'mj2',
      'video/mp4': 'mp4',
      'video/mpeg': 'mpeg',
      'video/ogg': 'ogv',
      'video/quicktime': 'qt',
      'video/vnd.dece.hd': 'uvh',
      'video/vnd.dece.mobile': 'uvm',
      'video/vnd.dece.pd': 'uvp',
      'video/vnd.dece.sd': 'uvs',
      'video/vnd.dece.video': 'uvv',
      'video/vnd.dvb.file': 'dvb',
      'video/vnd.fvt': 'fvt',
      'video/vnd.mpegurl': 'mxu',
      'video/vnd.ms-playready.media.pyv': 'pyv',
      'video/vnd.uvvu.mp4': 'uvu',
      'video/vnd.vivo': 'viv',
      'video/webm': 'webm',
      'video/x-f4v': 'f4v',
      'video/x-fli': 'fli',
      'video/x-flv': 'flv',
      'video/x-m4v': 'm4v',
      'video/x-matroska': 'mkv',
      'video/x-mng': 'mng',
      'video/x-ms-asf': 'asf',
      'video/x-ms-vob': 'vob',
      'video/x-ms-wm': 'wm',
      'video/x-ms-wmv': 'wmv',
      'video/x-ms-wmx': 'wmx',
      'video/x-ms-wvx': 'wvx',
      'video/x-msvideo': 'avi',
      'video/x-sgi-movie': 'movie',
      'video/x-smv': 'smv',
      'text/vtt': 'vtt',
      'application/x-chrome-extension': 'crx',
      'text/x-component': 'htc',
      'video/MP2T': 'ts',
      'text/event-stream': 'event-stream',
      'application/x-web-app-manifest+json': 'webapp',
      'text/x-markdown': 'markdown'
    };

    function getTypesMapping() {
      return extensions;
    }

    function getExtension(mimeType) {
      if (!mimeType) {
        return;
      }
      var type = mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();
      return extensions[type];
    }

    function getType(mimeType) {
      if (!mimeType) {
        return;
      }
      var type = mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();
      if (type.indexOf('/') >= 0) {
        return type.substring(0, type.indexOf('/'));
      }
      return;
    }

    return {
      getExtension: getExtension,
      getType: getType,
      getTypesMapping: getTypesMapping
    };
  })
  .filter('extension', function(contentTypeService) {
    return function(contentType) {
      return contentTypeService.getExtension(contentType);
    };
  })


  .service('XMLHttpRequest', function($window) {
    return $window.XMLHttpRequest;
  })

  .factory('xhrWithUploadProgress', function(XMLHttpRequest) {
    return function(callback) {
      return function() {
        var xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', callback);

        return xhr;
      };
    };
  });
