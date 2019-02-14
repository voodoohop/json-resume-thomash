// const fs = require("fs");

// console.log(fs.readFileSync);

 
const linkedin_raw = require("./linkedin_raw");


const R = require("ramda");
const L = require("partial.lenses");

const linkedin_included = linkedin_raw.included;

// console.log(linkedin_included);
// const check$Type = R.propEq("$type")

const complementaryInformation = 
{
  basics: {
    email: "t.haferlach@gmail.com",
    phone: "+49 (0)176 58158410",
    profiles: [
      { 
        network:"Instagram",
        username: "thomash_voodoo",
        url: "https://instagram.com/thomash_voodoo/"
      }
    ]
  } 
};

const genericLinkedinTransformer = 
{
  "com.linkedin.common.Date": ({year, month}) => 
  {  console.log({year,month});
    return new Date(year || 2018,month || 1).toISOString().slice(0,10)
  },//R.pick(["year","month"]),
  "com.linkedin.voyager.common.DateRange": R.pick(["startDate","endDate"]),
  "com.linkedin.voyager.identity.profile.Education": R.compose(R.assoc("category","education"),R.pick(["schoolName", "degreeName", "fieldOfStudy", "timePeriod", "description", "grade"])),
  "com.linkedin.voyager.identity.profile.Position": R.compose(R.assoc("category","work"),R.pick(["locationName", "companyName", "title", "timePeriod", "description"])),
  "com.linkedin.voyager.identity.profile.Honor": R.compose(R.assoc("category","award"),R.pick(["issueDate", "issuer", "title"])),
  "com.linkedin.voyager.identity.profile.Publication": R.compose(R.assoc("category","publications"),R.pick(["name","date","publisher", "description", "url"])),
  "com.linkedin.voyager.identity.profile.Profile": R.compose(R.assoc("category","basics"),R.pick(["summary","lastName","locationName","birthDate","firstName", "headline","location"])),
  "com.linkedin.voyager.identity.profile.Language": R.compose(R.assoc("category","languages"),R.pick(["name","proficiency"])),
  "com.linkedin.voyager.identity.profile.Honor": R.compose(R.assoc("category","awards"),R.pick(["issueDate", "issuer", "title","description"]))
 
  // "com.linkedin.voyager.identity.profile.ProfileLocation": R.path(["basicLocation","postalCode"])
};


const transform = ({$type, ...o}) => genericLinkedinTransformer[$type] ? genericLinkedinTransformer[$type](o) : {};

const deepTransform = o => R.is(Object, o) ? transform(R.map(deepTransform, o)) : o;


const categorize = linkedin_data => linkedin_data.map(deepTransform).filter(t => t != null)


const groupByCategories = R.groupBy(R.prop("category"));


const transform_basics = ([
  {
    firstName, 
    lastName, 
    headline,
    locationName,
    ...rest
  }]) => (
    {      
      ...rest,
      name: `${firstName} ${lastName}`, 
      label:headline,
      location: {address: locationName},

    }); 

const format_basics =  R.over(R.lensProp("basics"), transform_basics);

const applyComplementaryInformation = R.mergeDeepLeft(complementaryInformation);

const sortByStartDate= R.sortBy(R.prop("startDate"));

const format_publication = ({
    name,
    description,
    publisher,
    date,
    ...rest
  }) => ({
      ...rest,
      name,
      summary: description,
      publisher,
      releaseDate: date
     });

const format_publications = R.over(R.lensProp("publications"), R.map(format_publication))

const format_employment = ({
  companyName,
  description,
  title,
  timePeriod,
  locationName,
  ...rest
}) => ({
    ...rest,
    company:companyName,
    [description && "summary"]: description,
    position:title,
    startDate: timePeriod.startDate,
    [timePeriod.endDate && 'endDate']: timePeriod.endDate,
    location:locationName
    // "highlights": [
    //   "Started the company","went to work"
    // ]
   });
   

const format_positions = R.over(R.lensProp("work"), R.compose(R.reverse, sortByStartDate,R.map(format_employment)))

const format_education = ({
  schoolName,
  degreeName,
  description,
  timePeriod,
  fieldOfStudy,
  grade,
  ...rest
}) => ({
    ...rest,
    institution: schoolName,
    studyType: degreeName,
    [fieldOfStudy && "area"]: fieldOfStudy,
    summary: description,
    startDate: timePeriod.startDate,
    [timePeriod.endDate && 'endDate']: timePeriod.endDate, 
    gpa:grade, 
    "courses": [
      "Did computer vision"
    ]
   });
   
const format_educations = R.over(R.lensProp("education"), R.map(format_education))


const format_award = ({
  issueDate,
  issuer,
  title,
  description,
  ...rest
}) => ({
    ...rest,
    title,
    date: issueDate,
    [issuer && "awarder"]: issuer,
    [description && "summary"]: description,   
   });
   
const format_awards = R.over(R.lensProp("awards"), R.map(format_award))


const languageProficiencies= {
  NATIVE_OR_BILINGUAL:"Native speaker",
  FULL_PROFESSIONAL:"Full professional",
  LIMITED_WORKING:"Limited working knowleedge"
};

const format_language = ({
  name,
  proficiency,
  ...rest
}) => ({
    ...rest,
    language: name,
    fluency: languageProficiencies[proficiency]
   });
   
const format_languages = R.over(R.lensProp("languages"), R.map(format_language))


const transformation_pipeline = R.compose(
  R.pick(["basics","publications","work","education","languages","awards"]),
  applyComplementaryInformation,
  format_awards,
  format_languages,
  format_educations,
  format_positions,
  format_publications,
  format_basics,
  groupByCategories,
  categorize
);

const transformed = transformation_pipeline(linkedin_included);



console.log(transformed);

const fs = require("fs");

var resumeSchema  = require('resume-schema');
resumeSchema.validate(transformed, function (report,err) {
  if (err) {
    console.log("error:",err);
    return;
  }
  console.log('Resume validated successfully:', report);
  fs.writeFileSync("resume.json", JSON.stringify(transformed));
});
// const skills = linkedin_included.filter(({$type}) => $type === "com.linkedin.voyager.entities.shared.MiniSkill")

// console.log(skills);


// const education_raw = linkedin_included.filter((({$type})=> $type === "com.linkedin.voyager.identity.profile.Education"))

// const educationPicker = R.pick(["schoolName", "degreeName", "fieldOfStudy", "timePeriod", "description", "grade"]);

// const awards_raw = linkedin_included.filter(({$type})=> $type === "com.linkedin.voyager.identity.profile.Honor");

// const awardPicker = R.pick(["issueDate", "issuer", "title"]);

// const education = education_raw.map(educationPicker);

// const awards = awards_raw.map(awardPicker);

// console.log(education, awards);

// const checkEntryType =  type => R.propEq("$type", `com.linkedin.voyager.identity.profile.${type}`)

// const convertTimePeriod = R.pick(["year","month"])
// const transformDateTypes = R.compose(R.over(R.lensPath(["timePeriod","startDate"]), convertTimePeriod)/*, R.over(R.lensPath(["timePeriod","endDate"]), convertTimePeriod)*/)

// const transformModel = [
//   { 
//     name: "Skills",
//     condition: checkEntryType("Skill"),
//     transform: R.prop("name")
//   },
//   { 
//     name: "Education",
//     condition: checkEntryType("Education"),
//     transform: R.compose(R.pick(["schoolName", "degreeName", "fieldOfStudy", "timePeriod", "description", "grade"]), transformDateTypes)
//   },
//   { 
//     name: "Positions",
//     condition: checkEntryType("Position"),
//     transform: R.compose(R.pick(["locationName", "companyName", "title", "timePeriod", "description"]), transformDateTypes)
//   }
// ];



// const transformLinkendinJSON = lnkdn_inc => transformModel.map(({name, condition, transform}) => ({name, entries: lnkdn_inc.filter(condition).map(transform)}));

// console.log(JSON.stringify(transformLinkendinJSON(linkedin_included)));
// // console.log(L.collect(["included", L.elems, "$type"], linkedin_raw))


// // const getEntriesByType = type =>  [L.elems, L.when(R.propEq("$type", `com.linkedin.voyager.identity.profile.${type}`))]

// // console.log(L.collect([getEntriesByType("Skill"), "name"],linkedin_included))

// // console.log(L.collect([getEntriesByType("Education")],linkedin_included))

// // console.log(L.collect([L.elems, L.cond([])]))


// const check$Type = R.propEq("$type")

// // const everywhere = L.lazy(
// //   rec => L.ifElse(R.has("$type"), L.seq([L.children, rec], []), [])
// // )

// const genericLinkedinTransformer = [
// {
//   condition: check$Type("com.linkedin.common.DateRange"),
//   transform: R.pick(["startDate","endDate"])
// },
// {
//   condition: check$Type("com.linkedin.voyager.identity.profile.Education"),
//   transform: R.pick(["schoolName"])
// },
// {
//   condition: check$Type("com.linkedin.voyager.identity.shared.MiniProfile"),
//   transform: R.pick(["bla"])
// }
// ];


// const transformLinkedin = 
// R.when(
//   R.is(Object),
//   R.pipe(
//     // R.anyPass(genericLinkedinTransformer.map(({condition})=> condition)),
//       ...genericLinkedinTransformer.map(({condition,transform}) =>  R.when(condition, transform)),
//       R.map(a => transformLinkedin(a))
//   )
// )

// console.log(transformLinkedin(linkedin_included));