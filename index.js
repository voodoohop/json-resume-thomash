var fs = require("fs");
var Handlebars = require("handlebars");
var countries = require('country-data').countries;

function render(resume) {
	var template = fs.readFileSync(__dirname + "/resume.template", "utf-8");

  var printCSS = fs.readFileSync(__dirname + "/css/print.css", "utf-8");
	var standardCSS = fs.readFileSync(__dirname + "/css/style.css", "utf-8");
	var screenCSS = fs.readFileSync(__dirname + "/css/screen.css", "utf-8");

	// Get a country from the country code
	resume.basics.location.country = countries[resume.basics.location.countryCode].name;

  // http://stackoverflow.com/a/12002281/1263876
	// TODO
  Handlebars.registerHelper("foreach",function(arr,options) {
      if(options.inverse && !arr.length)
          return options.inverse(this);

      return arr.map(function(item,index) {
          item.$index = index;
          item.$first = index === 0;
          item.$notfirst = index !== 0;
          item.$last  = index === arr.length-1;
          return options.fn(item);
      }).join('');
  });

	// Remove http and www from url
	Handlebars.registerHelper('no-http', function(options) {
		this.url = this.url.replace(/(https?:\/\/)?(www\.)?/, "");
	  return options.fn(this);
	});

	// Get a font awsome class from a name
	Handlebars.registerHelper('fontAwesome', function(str) {
		return "fa-" + str.toLowerCase() + "-square";
	});

  // http://stackoverflow.com/a/16315366
  Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
  });

  // http://stackoverflow.com/a/18831911
  Handlebars.registerHelper('commalist', function(items, options) {
    return options.fn(items.join(', '));
  });

  //Uncomment this for printing as .pdf
	return Handlebars.compile(template)({
		resume: resume,
		standardCSS: standardCSS,
    printCSS: printCSS,
		screenCSS: screenCSS
	});
}

module.exports = {
	render: render
};
