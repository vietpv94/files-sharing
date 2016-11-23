'use strict';

angular.module('dsp.file', ['ngFileUpload', 'dsp.http'])

  .constant('FILES_API_URL', '/api/file')
  .constant('DEFAULT_FILE_TYPE', 'application/octet-stream')

  .factory('fileUploadService', function($q, $timeout, fileAPIService, FILES_API_URL, DEFAULT_FILE_TYPE) {

    function get() {
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
            console.log('Tasks are complete:', result);
          };

        error = error || function(err) {
            console.log('Error while processing tasks:', err);
          };

        progress = progress || function(evt) {
            console.log('Tasks progress:', evt);
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

        task.uploader = fileAPIService.uploadFile(FILES_API_URL, task.file, task.file.type || DEFAULT_FILE_TYPE, task.file.size, {}, task.canceler.promise)
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
  .factory('fileAPIService', function($q, $rootScope, Upload, getFolder, xhrWithUploadProgress, dspRestangular) {
    function _inApply(fn) {
      return function(value) {
        if ($rootScope.$$phase) {
          return fn(value);
        }

        return $rootScope.$apply(function() {
          fn(value);
        });
      };
    }
    function uploadFile(url, file, mime, size, options, canceler) {
      var params = {mimetype: mime, size: size, name: file.name, folderId: getFolder.id};
      var defer = $q.defer();
      if (options) {
        angular.extend(params, options);
      }
      return Upload.upload({
        method: 'POST',
        url: url,
        headers: {'Content-Type': mime},
        file: file,
        data: {},
        params: params,
        withCredentials: true,
        timeout: canceler,
        success: _inApply(defer.resolve),
        error: function(xhr, status, error) {
          _inApply(defer.reject)({
            xhr: xhr,
            status: status,
            error: error
          });
        },
        xhr: xhrWithUploadProgress(_inApply(defer.notify))
      });
    }

    function remove(parameter, id) {
      return dspRestangular.one(parameter, id).remove();
    }

    return {
      uploadFile: uploadFile,
      remove: remove
    };
  })
  .service('XMLHttpRequest', function($window) {
    return $window.XMLHttpRequest;
  })

  .factory('getFolder', function($stateParams) {
    return {id: $stateParams.folderId};
  })

  .factory('xhrWithUploadProgress', function(XMLHttpRequest) {
    return function(callback) {
      return function() {
        var xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', callback);

        return xhr;
      };
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
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.openxmlformats-officedocument.presentationml.slide': 'sldx',
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'ppsx',
      'application/x-gzip': 'gz',
      'application/pdf': 'pdf',
      'audio/mp4': 'mp4a',
      'audio/ogg': 'oga',
      'audio/webm': 'weba',
      'audio/flac': 'flac',
      'audio/matroska': 'mka',
      'audio/mpegurl': 'm3u',
      'audio/ms-wax': 'wax',
      'audio/ms-wma': 'wma',
      'audio/wav': 'wav',
      'audio/mp3': 'mp3',
      'image/gif': 'gif',
      'image/jpeg': 'jpeg',
      'image/png': 'png',
      'image/sgi': 'sgi',
      'image/svg+xml': 'svg',
      'image/vnd.adobe.photoshop': 'psd',
      'image/vnd.dece.graphic': 'uvi',
      'image/vnd.dvb.subtitle': 'sub',
      'image/webp': 'webp',
      'image/x-icon': 'ico',
      'model/vnd.dwf': 'dwf',
      'model/vnd.gdl': 'gdl',
      'model/vnd.gtw': 'gtw',
      'model/vnd.mts': 'mts',
      'model/vnd.vtu': 'vtu',
      'model/vrml': 'wrl',
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
  .filter('bytes', function() {
    return function(bytes, precision) {
      if (bytes === 0) {
        return '0 bytes';
      }

      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '-';
      }

      if (typeof precision === 'undefined') {
        precision = 1;
      }

      var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024)),
        val = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);

      return (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) + '' + units[number];
    };
  });
