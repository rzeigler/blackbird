const fs = require("fs");
const Promise = require("./Promise");
const getFileStats = require("./getFileStats");
const getMimeType = require("./getMimeType");
const formatByteSize = require("./formatByteSize");
const formatString = require("util").format;
const joinPaths = require("./joinPaths");

const BB_VERSION = require("../version");
const R = require("ramda");

const PAGE_TEMPLATE = [
    "<html>",
    "<head>",
    "<meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\" />",
    "<title>%s</title>",
    "<style type=\"text/css\">",
    "  body { font: 14px Helvetica, Arial, sans-serif; padding: 0 10px; }",
    "  address { text-align: right; font-style: italic; }",
    "  table { width: 100%; }",
    "  tr.even { background: #f3f3f3; }",
    "  .name { text-align: left; }",
    "  .size, .type, .mtime { text-align: right; }",
    "</style>",
    "</head>",
    "<body>",
    "<h1>%s</h1>",
    "<hr>",
    "<table cellspacing=\"0\" cellpadding=\"3\">",
    "<tr>",
    "  <th class=\"name\">Name</th>",
    "  <th class=\"size\">Size</th>",
    "  <th class=\"type\">Type</th>",
    "  <th class=\"mtime\">Last Modified</th>",
    "</tr>",
    "%s",
    "</table>",
    "<hr>",
    "<address>%s/%s</address>",
    "</body>",
    "</html>"
].join("\n");

const ROW_TEMPLATE = [
    "<tr class=\"%s\">",
    "  <td class=\"name\"><a href=\"%s\">%s</a></td>",
    "  <td class=\"size\">%s</td>",
    "  <td class=\"type\">%s</td>",
    "  <td class=\"mtime\">%s</td>",
    "</tr>"
].join("\n");

function generateIndex(root, pathname, basename) {
    return new Promise(function (resolve, reject) {
        const path = joinPaths(root, pathname);

        fs.readdir(path, function (error, files) {
            if (error) {
                return reject(error);
            }

            const promises = files.map(function (file) {
                return getFileStats(joinPaths(path, file));
            });

            Promise.all(promises).then(function (statsArray) {
                let rows = formatString(ROW_TEMPLATE, "", "../", "Parent Directory", "", "", "");
                let className = "even";

                statsArray.forEach(function (stats, index) {
                    if (R.isNil(stats)) {
                        return; // Ignore broken symlinks!
                    }

                    let file = files[index];
                    let url = basename + pathname + file;
                    const mtime = stats.mtime;

                    let size, type;
                    if (stats.isDirectory()) {
                        size = "-";
                        type = "directory";
                        url += "/";
                        file += "/";
                    } else {
                        size = formatByteSize(stats.size);
                        type = getMimeType(file);
                    }

                    rows += `\n${formatString(ROW_TEMPLATE, className, url, file, size, type, mtime)}`;

                    className = className === "even" ? "odd" : "even";
                });

                const title = `Index of ${basename}${pathname}`;
                const content = formatString(PAGE_TEMPLATE, title, title, rows, "BB", BB_VERSION);

                resolve(content);
            }, reject);
        });
    });
}

module.exports = generateIndex;
