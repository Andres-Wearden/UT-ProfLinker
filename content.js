// chrome.runtime.onMessage.addListener(gotMessage);
// function gotMessage(request, sender, sendResponse){
//   insertWebIcon();
// }
let profMap;
let instructors = new Array();

fetchData().then(() => {
  insertHeader();
  insertWebIcon();
  //obsever callback function
  function changeObserved(){
    insertWebIcon();
  }
  
  //create MutationObserver Object
  let observer = new MutationObserver(changeObserved);
  
  //Mutation Obsever will observe for any changes within the document
  observer.observe(document, {childList: "true", subtree: "true"});
})

// insertHeader();
// //obsever callback function
// function changeObserved(){
//   insertWebIcon();
// }

// //create MutationObserver Object
// let observer = new MutationObserver(changeObserved);

// //Mutation Obsever will observe for any changes within the document
// observer.observe(document, {childList: "true", subtree: "true"});



//takes in "elem" as programmer created element and will put it after "afterWebEL" html object in webpage"
function insertAfter(elem, afterWebEL){
  afterWebEL.insertAdjacentHTML("afterend", elem.outerHTML);
}

//Puts "Class Summary" on header"
function insertHeader(){
  let targetArrayOfTh = document.querySelectorAll('th');
  let targetTh = targetArrayOfTh[targetArrayOfTh.length - 1];
  if(targetTh === undefined || targetTh === null){
    console.error("Th object is not defined or is null");
  }else{
    let main = document.getElementById("inner_body");
    main.setAttribute("style", "display: flex, flex-direction: row");
    let heading = document.createElement("th");
    heading.setAttribute("scope", "col");
    heading.setAttribute("style", "max-width: 55px");
    heading.innerText = "Rate my Professor";
    insertAfter(heading, targetTh);
  }
}

function insertWebIcon(){
  let targetArrayOfTr = document.querySelectorAll('td[data-th="Unique"]');
  let parentArrayofTr = new Array(targetArrayOfTr.length);
  for(let i = 0; i < targetArrayOfTr.length; i++){
    parentArrayofTr[i] = targetArrayOfTr[i].parentNode;
  }
  let arrInstructors = document.querySelectorAll('td[data-th="Instructor"]');
  for(let i = 0; i < targetArrayOfTr.length; i++){
    let customTdElement = document.createElement("td");
    customTdElement.setAttribute("class", "summary-area");
    customTdElement.setAttribute("style", "max-width: 55px");
    let instructors = getUTInstructors(arrInstructors[i]);
    let allTdElementsOfUTClass = parentArrayofTr[i].querySelectorAll("td");
    let profLink = new Array();
    for(let i = 0; i < instructors.length; i++){
      profLink.push(createLink(instructors[i]));
      customTdElement.appendChild(profLink[i]);
    }
    if(allTdElementsOfUTClass[allTdElementsOfUTClass.length - 1].getAttribute("class") !== "summary-area"){
      insertAfter(customTdElement, allTdElementsOfUTClass[allTdElementsOfUTClass.length - 1]);
    }
  }
}

function createLink(singleInstructor){
  let link = document.createElement("a");
  let noLink = document.createElement("p")
  let profID = profMap.get(singleInstructor);
  if(doesExist(profID)){
    link.setAttribute('href', 'https://www.ratemyprofessors.com/professor/' + profID);
    link.innerText = 'Link to RMP\n';
    return link;
  }else{
    noLink.innerText = 'No Link Found\n';
    return noLink;
  }
}

async function fetchData(){
  const response = await fetch(chrome.runtime.getURL('outputLowerCase.json'));
  profMap = new Map(await response.json());
}

// function capitalizeWord(allCapsWord) {
//   const capitalizedWord = allCapsWord.toLowerCase().charAt(0).toUpperCase() + allCapsWord.slice(1).toLowerCase();
//   return capitalizedWord;
// }


//change function so that it uses a trie and can more accurately determine professor.
//change function so that when it looks for a professor, it's not case sensitive (convert all letters to lowercase on map and when looking up prof);
function getUTInstructors(instructor){
  arrInstructors = new Array();
  let instructors = instructor.innerText;
  instructors = instructors.replace(/\n/g, ' ');
  instructors = instructors.split(' ');
  console.log('-------------' + instructors + '-------------');
  if(doesExist(instructors)){
    while(doesExist(instructors)){
      console.log(instructors);
      let lastName = getLastName(instructors, 0).replace(/,/g, '');
      let firstName = getFirstName(findFirstName(instructors), 0).replace(/' '/g, '');
      let singleInstructor = firstName + ' ' + lastName;
      console.log(singleInstructor);
      arrInstructors.push(singleInstructor.toLowerCase());
      instructors.shift();
      while(doesExist(instructors) && !instructors[0].includes(',')){
        instructors.shift();
      }
    }
  }else{
    arrInstructors.push('N/A');
  }
  return arrInstructors;
}

//function recursively collects the last names of prof if multiple last names are interpreted
function getLastName(arrName, index){
  if(!doesExist(arrName)) return;
  if(arrName[index].includes(',')){
    return arrName[index];
  }
  let lastName = arrName[index] + ' ' + getLastName(arrName, index + 1);
  let lastNameArr = lastName.split(' ');
  let temp = lastNameArr[1];
  lastNameArr[1] = lastNameArr[0];
  lastNameArr[0] = temp;
  lastName = lastNameArr[0] + '-' + lastNameArr[1]
  return lastName;
}

//commented out code recursively collects the first names of prof's if multiple first names are interpreted
function getFirstName(arrName, index){
  return arrName[index];
  // if(!doesExist(arrName)) return;
  // if(!doesExist(arrName[index + 1]) || arrName[index + 1].includes(',')){
  //   return arrName[index];
  // }
  // let firstName = arrName[index] + '-' + getFirstName(arrName, index + 1);
  // return firstName;
}

function findFirstName(arrName){
  let i = 0;
  while(!arrName[i].includes(',')){
    arrName.shift();
  }
  arrName.shift();
  return arrName;
}
function doesExist(object){
  return (typeof(object) != 'undefined' && typeof(object) != 'null' && object != '');
}

