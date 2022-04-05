var fs = require("fs");
var Handlebars = require("handlebars");
var countries = require('./resources/countryCodes.json');
var HandlebarsIntl = require('handlebars-intl');

var i18n = require("i18n");

var currentLocale="en-US"

i18n.configure({
	locales:['en', 'de'],
	directory: __dirname + '/locales'
});

i18n.setLocale(currentLocale.split("-")[0]);
console.log("locale",currentLocale);

function render(resume) {
	console.log("rendering", resume)
	var template = fs.readFileSync(__dirname + "/resume.template", "utf-8");

  var printCSS = fs.readFileSync(__dirname + "/css/print.css", "utf-8");
	var standardCSS = fs.readFileSync(__dirname + "/css/style.css", "utf-8");
	var screenCSS = fs.readFileSync(__dirname + "/css/screen.css", "utf-8");

	// Get a country from the country code
	resume.basics.location.country = countries[resume.basics.location.countryCode];

	// Remove http and www from url
	Handlebars.registerHelper('no-http', function(options) {
		this.url = this.url.replace(/(https?:\/\/)?(www\.)?/, "");
	  return options.fn(this);
	});

	// Get a font awsome class from a name
	Handlebars.registerHelper('fontAwesome', function(str) {
		return "fa-" + str.toLowerCase();
	});

  // http://stackoverflow.com/a/31632215/838789
	Handlebars.registerHelper({
	    and: function (v1, v2) {
	        return v1 && v2;
	    },
	    or: function (v1, v2) {
	        return v1 || v2;
	    }
	});

  // http://stackoverflow.com/a/18831911
  Handlebars.registerHelper('commalist', function(items, options) {
    return options.fn(items.join(', '));
	});

	// Handlebars.registerHelper('formatdate', function(text) {
	// 	return new Handlebars.SafeString(text.slice(0,7));
	// });
	
	Handlebars.registerHelper('breaklines', function(text) {
		text = Handlebars.Utils.escapeExpression(text);
		text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
		return new Handlebars.SafeString(text);
	});

	var intlData = {
		"locales": currentLocale,
		"formats": {
			"date": {
					"short": {
							"month": "numeric",
							"year": "numeric"
					}
			}
		}
  }


	Handlebars.registerHelper('markdown', require('helper-markdown'));
	Handlebars.registerHelper('t', function(text) {
		if (!text)
			return text;
		return i18n.__(text);
	});
	
	HandlebarsIntl.registerWith(Handlebars);
	// Handlebars.registerHelper("date")
  // Send all necessary resources to the handlebars template and compile it
	return Handlebars.compile(template)({
		resume: resume,
		standardCSS: standardCSS,
    printCSS: printCSS,
		screenCSS: screenCSS
	}, {
    data: {intl: intlData}
	});
}

module.exports = {
	render: render
};
// console.log("greeting")
// var greeting = i18n._s_('Hello');