"use strict";

var request = require("request")
var fs = require("fs");
var path = require("path");

module.exports = downloader;

/**
 * Downloads a given URL as a file at the saveAtPath location.
 *
 * @param {String} url The URL to a file to be downloaded.
 * @param {String} saveAtPath An existing file path to save the file.
 * @param {Function} callback CPS callback with the error/result.
 */
function downloader(url, saveAtPath, callback) {
  // Handle the parameter errors
  if (!url || !saveAtPath) {
    return callback(new Error("You need to provide the URL and the location to save the file!"));
  }
  if (url && typeof url !== "string") {
    return callback(new Error("The parameter 'url' must be a string"));
  }
  if (saveAtPath && typeof saveAtPath !== "string") {
    return callback(new Error("The parameter 'saveAtPath' must be a string"));
  }
  if (callback && typeof callback !== "function") {
    throw new Error("The callback provided must be a function");
  }

  // The directory to save the file.
  var dirToSave = path.dirname(saveAtPath);

  // Verify if the directory to save exists before downloading.
  fs.stat(dirToSave, function gettingStats(err) {
    if (err) {
      return callback(new Error("The path '" + dirToSave + "' does NOT exist!"));
    }
    request.get(url, function requestHandler(error, res) {
      if (error) {
        return callback(error)
      }
        // Finished downloading and getting the buffer to be saved.
      fs.writeFile(saveAtPath, res.body, function(err) {
        if (err) {
          var error = new Error("Error while saving image: " + err.message);
          if (err.code === "EISDIR") {
            error = new Error("Cannot save the url " + url + " as a directory " + saveAtPath);
          }
          callback(error);
        }
        fs.stat(saveAtPath, function(err, stat) {
          if (err) {
            callback(new Error("Error while getting image stats: " + err.message));
          }
          // Creating the response object.
          var response = {
            downloaded: true,
            filePath: saveAtPath,
            size: stat.size
          };
          // The request to the URL was successful and the file was saved.
          callback(null, response);
        });
      });
    });
  });
}
