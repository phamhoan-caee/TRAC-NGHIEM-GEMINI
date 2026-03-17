const questionBank = [
{
q:"Xe nâng khi xuống dốc có tải phải đi thế nào?",
options:{
A:"Đi tiến",
B:"Đi lùi",
C:"Đi ngang",
D:"Tắt máy"
},
correct:"B"
},

{
q:"Khi tầm nhìn bị che bởi hàng?",
options:{
A:"Rướn người nhìn",
B:"Lùi xe",
C:"Tăng tốc",
D:"Nhờ người ngồi lên"
},
correct:"B"
},

{
q:"Khoảng cách an toàn với người đi bộ?",
options:{
A:"0.5m",
B:"1m",
C:"2m",
D:"5m"
},
correct:"C"
},

{
q:"Khi đỗ xe nâng phải?",
options:{
A:"Hạ càng",
B:"Kéo phanh tay",
C:"Tắt máy",
D:"Tất cả"
},
correct:"D"
}
];

let examQuestions=[]
let userAnswers=[]
let current=0
let timeLeft=1200
let timer

function startExam(){

let name=document.getElementById("inputName").value.trim()
let cls=document.getElementById("inputClass").value.trim()

if(!name || !cls){

alert("Nhập đầy đủ thông tin")

return
}

document.getElementById("studentName").innerText=name

document.getElementById("login").style.display="none"
document.getElementById("header").classList.remove("hidden")
document.getElementById("main").classList.remove("hidden")

initExam()

}

function initExam(){

let pool=[...questionBank]

while(pool.length<30){

pool=pool.concat(questionBank)

}

examQuestions=pool.sort(()=>Math.random()-0.5).slice(0,30)

userAnswers=new Array(30).fill(null)

renderGrid()

showQuestion(0)

startTimer()

}

function renderGrid(){

let grid=document.getElementById("grid")

grid.innerHTML=""

for(let i=0;i<30;i++){

let d=document.createElement("div")

d.className="grid-item"

d.innerText=i+1

d.onclick=()=>showQuestion(i)

d.id="grid"+i

grid.appendChild(d)

}

}

function showQuestion(i){

current=i

let q=examQuestions[i]

document.getElementById("questionText").innerText=
`Câu ${i+1}: ${q.q}`

let options=document.getElementById("options")

options.innerHTML=""

for(let key in q.options){

let div=document.createElement("div")

div.className="option"

if(userAnswers[i]===key){

div.classList.add("selected")

}

div.innerHTML=`<b>${key}.</b> ${q.options[key]}`

div.onclick=()=>selectAnswer(i,key)

options.appendChild(div)

}

document.querySelectorAll(".grid-item")
.forEach(e=>e.classList.remove("active"))

document.getElementById("grid"+i)
.classList.add("active")

}

function selectAnswer(qIdx,ans){

userAnswers[qIdx]=ans

document.getElementById("grid"+qIdx)
.classList.add("answered")

showQuestion(qIdx)

}

function nextQuestion(){

if(current<29){

showQuestion(current+1)

}

}

function prevQuestion(){

if(current>0){

showQuestion(current-1)

}

}

function startTimer(){

timer=setInterval(()=>{

timeLeft--

let m=Math.floor(timeLeft/60)

let s=timeLeft%60

document.getElementById("timer").innerText=
`${m}:${s<10?"0":""}${s}`

if(timeLeft<=0){

submitExam()

}

},1000)

}

function submitExam(){

clearInterval(timer)

let score=0

examQuestions.forEach((q,i)=>{

if(userAnswers[i]===q.correct){

score++

}

})

alert(`Bạn đúng ${score}/30 câu`)

location.reload()

}
