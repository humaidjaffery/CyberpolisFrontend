import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, HostListener, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';

import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import { ModuleService } from '../module.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModuleService } from '../user-module.service';
import { ChatService } from '../chat.service';
import katex, {KatexOptions} from 'katex';
import { environment } from 'src/environments/environment';
import { NgxKatexComponent } from 'ngx-katex';
import { contain } from 'three/src/extras/TextureUtils.js';




@Component({
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrl: './module.component.css',
})
export class ModuleComponent implements OnInit, AfterViewInit {
  mediaCdnUrl = environment.mediaCdnUrl
  isBrowser: any;
  messages: any[] = []
  replies: string[] = []
  questions: any[] = [ ];
  canvasElement: HTMLCanvasElement | null | undefined;
  codeSaved = true
  codeLineMode = false
  chatbotHelpHidden = true
  showTest = false

  code = ""; // Initial code to display in the editor
  moduleId = ''
  moduleInfo: any = {}
  userModuleInfo: any = {}
  content = ""

  @ViewChild('chatInput') chatInput!: ElementRef;
  highlightButtonTop = -1
  highlightButtonLeft = -1
  highlight = ""
  message = ""
  testResponse:any = []
  selectedTest = -1

  blockBankSolution: any[] = [];
  blockBank: any[] = [];
  blockMode: any[] = [];

  editorOptions = {
    fontSize: '16px',
    showLineNumbers: true,
    tabSize: 4,
  };

  constructor(
    private moduleService: ModuleService,
     public router: Router, private route: ActivatedRoute,
    private userModuleService: UserModuleService,
    private chatService: ChatService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit() {
    this.codeSaved = true
    //getting route info
    this.route.params.subscribe({
      next: this.getModuleId.bind(this)
    })
    
    //getting module Info
    this.moduleService.getModule(this.moduleId).subscribe({
      next: this.handleModuleInfo.bind(this),
      error: this.handleError.bind(this)
    })

    //getting user module info
    this.userModuleService.getUserModuleRelation(this.moduleId).subscribe({
      next: this.handleUserModuleInfo.bind(this),
      error: this.handleError.bind(this)
    })

  }

  getModuleId(routeInfo: any){
    this.moduleId = routeInfo['module_id'];
  }


  @ViewChild('moduleContentDiv', { static: true }) moduleContentDiv!: ElementRef<HTMLDivElement>;

  handleModuleInfo(data: any){
    this.moduleInfo = data;

    this.moduleContentDiv.nativeElement.innerHTML = this.moduleInfo.moduleContent
    
    const specialDivs = this.elementRef.nativeElement.querySelectorAll('[data-katex]');
    console.log(specialDivs)
    specialDivs.forEach((div: HTMLElement) => {
      const formula = div.getAttribute('data-katex');
      const displayMode = div.getAttribute('displayMode') == 'true'
      div.innerHTML = katex.renderToString(formula, {displayMode: displayMode})
    });
    
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(this.moduleInfo.moduleContent, 'text/html');
    //moduleContent katex Render
    // const equations = doc.querySelectorAll('[data-katex]');
    // console.log(equations) 
    // for(let i=0; i<equations.length; i++){
    //   var html = katex.renderToString(equations[i].getAttribute('data-katex'), {
    //     displayMode: true,
    //     throwOnError: false,
    //   });
    //   equations[i].innerHTML = html
    // }
    // console.log(doc.documentElement.childNodes[0])
    // this.moduleInfo.moduleContent = doc.documentElement.innerHTML



    //Initial Code
    for(var i=0; i<this.moduleInfo.initialModuleCode.length; i++ ){
      this.code += this.moduleInfo.initialModuleCode[i] + "\n"
    }

    //Questions
    for(var i=0; i<this.moduleInfo.questions.length; i++){
      const question = {
        "question": this.moduleInfo.questions[i]['question'],
        "choices": this.moduleInfo.questions[i]['choices'],
        "answer": this.moduleInfo.questions[i]['answer'],
        "explanation": this.moduleInfo.questions[i]['explanation'],
        "selectedChoice": "",
        "incorrectChoices": [],
      }
      this.questions.push(question)
    }

    //blocks
    for(var i=0; i<this.moduleInfo.moduleCodeSolution.length; i++){
      this.blockMode.push(false)
      this.blockBank.push({
        "verbose": this.moduleInfo.blocks[i],
        "code": this.moduleInfo.moduleCodeSolution[i]
      })
    }

    //shuffling blocks
    this.blockBankSolution = [...this.blockBank]
    this.blockBank = this.blockBank.sort(() => Math.random() - 0.5)
    
    //mixAndMatch
    if(this.moduleInfo.mixAndMatch != null){
      for(let i=0; i<this.moduleInfo.mixAndMatch.length; i++){
        this.itemList.push({
          "value": this.moduleInfo.mixAndMatch[i][0],
          "match": i
        });
        this.itemList.push({
          "value": this.moduleInfo.mixAndMatch[i][1],
          "match": i
        });
      }

      //shuffling mix and match
      this.itemList = this.itemList.sort(() => Math.random() - 0.5)
      //correctMixAndMatch
      for(let i = 0; i<this.moduleInfo.mixAndMatch.length; i++){
        this.correctMixAndMatch.push(false, false)
      }
    }
    
    console.log(this.moduleInfo)
  }

  handleUserModuleInfo(data: any){
    this.userModuleInfo = data
    console.log(this.userModuleInfo)

    //questions
    for(var i =0; i<this.userModuleInfo.questionsCorrect.length; i++){
      if(this.userModuleInfo.questionsCorrect[i]){
        this.questions[i].correct = true
        this.questions[i].selectedChoice = this.questions[i].answer
      }
    }

    //code
    this.code = ""
    for(var i=0; i<this.userModuleInfo.moduleUserCode.length; i++ ){
      this.code += this.userModuleInfo.moduleUserCode[i] + "\n"
    }
    //message History
    this.userModuleInfo.messageHistory.forEach((element: any) => {
        this.messages.push({
          "content": element.prompt,
          "date": element.date
        }, {
          "content": element.reply,
          "date": element.date
        })
    });
  }

  handleError(error: any){
    console.log(error)
  }

  goToCourse(){
    this.router.navigate(['course', this.moduleInfo.course.courseId, this.moduleInfo.course.courseName])
  }
  
  onCodeChanged(event: any) {
    // console.log(this.code.split("\n")[0]);
    this.codeSaved = false  
  }

  runCode(){
    this.showTest = false
    this.userModuleService.runCode(this.code.split("\n"), this.moduleId).subscribe({
      next: this.handleCodeSubmission.bind(this),
      error: this.handleError.bind(this)
    })

  }

  saveCode(){
    this.userModuleService.saveCode(this.code.split("\n"), this.moduleId).subscribe({
      error: this.handleError.bind(this)
    })
    setTimeout(() => {
      this.codeSaved = true;
    }, 250);
  }

  handleCodeSubmission(response: any){
    console.log(response)
    this.testResponse = response
    this.showTest = true

    for(let i=0; i<this.testResponse.length; i++){
      if(this.testResponse[i].passed){
        this.userModuleInfo.testsPassed[i] = true
      }
    }

    this.checkIfComplete()
  }

  checkIfComplete(){
    if(this.userModuleInfo.testsPassed.indexOf(false) == -1 && this.userModuleInfo.questionsCorrect.indexOf(false) == -1){
      this.userModuleInfo.completed = true
    }
  }

  ngAfterViewInit(): void {
    //Enter Shortcut for chat message
    this.chatInput.nativeElement.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.shiftKey) {
        this.message += "\n"
      } else if (event.key == 'Enter'){
        this.sendMessage();
      }
    });  

    //Lottie for Ripple Save 
    // this.canvasElement = document.querySelector('#ripple-save') as HTMLCanvasElement | null;

    // if (this.canvasElement) {
    //   const dotLottie = new DotLottie({
    //     autoplay: true,
    //     loop: true,
    //     canvas: this.canvasElement,
    //     src: "https://lottie.host/fe2754b8-c3c0-4406-9511-058f08133a3f/fzIyfXvoap.json", // replace with your .lottie or .json file URL
    //   });
    // } else {
    //   console.error('Canvas element not found');
    // }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Check if 'Ctrl' and 'S' are pressed simultaneously
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault(); // Prevent the browser's default save dialog
      this.saveCode(); // Call your save function
    }
  }


  onTextSelect(data: any){
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      this.highlight = selection.toString() 
      const range = selection.getRangeAt(0).getBoundingClientRect();
      this.highlightButtonTop = range.top + window.scrollY - 30; 
      this.highlightButtonLeft = ((range.left + range.right)/2) + window.scrollX;
    } else {
      this.highlight = ""
    }
  }

  saveHighlight(){
    this.message += " '" + this.highlight + "' "
    this.highlight = ""
    this.showChat()
    this.chatInputFocus()
  }

  focusedHighlight = 0;

  // Block Drop Event
  drop(event:any) {
      moveItemInArray(this.blockBank, event.previousIndex, event.currentIndex);
  }

  selectedTab = 'code';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  showChat(){
    this.chatbotHelpHidden = false
    this.chatbotPopup.nativeElement.focus()
  }

  chatInputFocus(){
    this.chatBotInputHeight = Math.max(this.chatBotInputHeight, this.chatbotHeight / 2)
    console.log(this.chatBotInputHeight)
  }

  chatInputBlur(){
    this.chatBotInputHeight = this.chatbotHeight / 6
    console.log(this.chatBotInputHeight)
  }

  isFullScreen(){
    return this.chatbotHeight == window.innerHeight
  }

  chatFullScreen(){
    if(this.chatbotHeight == window.innerHeight){
      this.chatbotHeight = window.innerHeight / 1.5
    } else {
      this.chatbotHeight = window.innerHeight
    }
    console.log(this.chatbotHeight, this.chatBotInputHeight)
  }

  sendMessage() {
    const inputElement = this.chatInput.nativeElement;
    const message = inputElement.value.trim();
    if(!message) {
      return;
    }
    inputElement.value = ''; 
    this.messages.push({"content": message})
    this.chatService.sendMessage(this.moduleId, message,).subscribe({
      next: this.handleNewChatMessage.bind(this),
      error: this.handleError.bind(this)
    })
  }


  usedTokens: number;
  handleNewChatMessage(data: any){
    if(data.outOfTokens){
      this.messages.push("Sorry, You are out of silicon chips")
      this.chatInput.nativeElement.disabled = true
    }
    this.messages.pop()
    this.messages.push({
      "content": data.prompt,
      "date": data.date
    },{
      "content": data.reply,
      "date": data.date
    })
    this.usedTokens = data.tokens
    this.userModuleInfo.currency -= data.tokens
  }

  onMessageChanged(){
    if(this.codeLineMode === true){
      const codeLine = this.message.split('@')
      if(codeLine.length > 2){
        this.codeLineMode = false
        return
      }

      if(this.message[this.message.length-1] == " "){
        console.log("EXECUTE LINE")
        const ends = codeLine[1].split("-")
        const lines: number[] = []
        if(ends.length > 1){
          for(let i = parseInt(ends[0]); i<parseInt(ends[ends.length-1])+1; i++){
            lines.push(i)
          }
        } else {
          lines.push(parseInt(ends[0]))
        }

        let codeHighlight = ""
        const codeArray = this.code.split("\n") 
        lines.forEach((line) => {
          if(line < codeArray.length && line > 0){
            codeHighlight += codeArray[line-1] + "\n"
          }
        })
        
        //Changing the message of the input
        this.message = this.message.split("@")[0]  
          //TO DO: Change the style of just the codeHighlight PART and add an 'X' button to delete all of it quickly 
        this.message += "\n```\n" + codeHighlight +"```\n"
        this.codeLineMode = false
      }
    }

    if(this.message[this.message.length-1] == '@'){
      this.codeLineMode = true
      console.log("SPECIAL")
    }
  }

  @ViewChild('contentSection') contentSection!: ElementRef;
  @ViewChild('workSection') workSection!: ElementRef;
  @ViewChild('testSection') testSection!: ElementRef;
  @ViewChild('chatbotPopup') chatbotPopup!: ElementRef;
  chatbotHeight: number = window.innerHeight / 1.5; // Initial height
  chatBotInputHeight: number = this.chatbotHeight / 6
  isDragging = false;
  
  isDraggingDivider = false;
  contentWidth = 50; 
  testHeight = window.innerHeight / 3;
  resizeType = "content"

  onDividerResizeStart(event: MouseEvent, type: string) {
    this.resizeType = type
    this.isDraggingDivider = true;
    event.preventDefault();
    document.addEventListener('mousemove', this.onDividerResize);
    document.addEventListener('mouseup', this.onDividerResizeEnd);
  }

  onDividerResize = (event: MouseEvent) => {
    if (this.isDraggingDivider) {
      if(this.resizeType == "content"){
        const containerWidth = this.contentSection.nativeElement.parentElement.offsetWidth;
        const newContentWidth = (event.clientX / containerWidth) * 100;
        this.contentWidth = Math.max(20, Math.min(newContentWidth, 99));
      } else if (this.resizeType == "test"){
        const newHeight = window.innerHeight - event.clientY;
        this.testHeight = Math.max(100, Math.min(newHeight, window.innerHeight - 100));
      } else if (this.resizeType == "chat"){
        const newHeight = window.innerHeight - event.clientY;
        this.chatbotHeight = Math.max(100, Math.min(newHeight, window.innerHeight - 100));
      } else if (this.resizeType == "chatInput"){
        console.log("here")
        const newHeight = window.innerHeight - event.clientY;
        this.chatBotInputHeight = Math.max(5000, Math.min(newHeight, window.innerHeight - 100));
      }
    }
  }

  onDividerResizeEnd = () => {
    this.isDraggingDivider = false;
    document.removeEventListener('mousemove', this.onDividerResize);
    document.removeEventListener('mouseup', this.onDividerResizeEnd);
  }


  selectChoice(questionIndex: number, choice: string) {
    this.questions[questionIndex]['selectedChoice'] = choice;
  }

  checkAnswer(questionIndex: number) {
    console.log(this.questions[questionIndex]['answer'])
    if (this.questions[questionIndex]['selectedChoice'] == this.questions[questionIndex]['answer']){
      this.userModuleInfo.questionsCorrect[questionIndex] = true;
      
      this.userModuleService.updateCorrectQuestion(this.moduleId, this.userModuleInfo.questionsCorrect).subscribe({
        next: this.handleUpdateQuestion.bind(this),
        error: this.handleError.bind(this)
      })
      return
    }
    this.questions[questionIndex].incorrectChoices.push(this.questions[questionIndex].selectedChoice)
    console.log(this.questions[questionIndex].incorrectChoices)
  }

  handleUpdateQuestion(tokens){
    this.userModuleInfo.currency = tokens
  }

  selectedLeft = -1;
  selectedRight = -1;
  correctMixAndMatch: boolean[] = [];
  itemList: any = []
  incorrectMixAndMatch: number[] = []

  mixAndMatchSelect(index: number){
    console.log(this.selectedLeft, this.selectedRight)
    this.incorrectMixAndMatch = []
    if(this.selectedLeft < 0){
      this.selectedLeft = index
      console.log("FiRST", this.selectedLeft)
      return
    }

    if(this.selectedRight < 0 && this.selectedLeft != index){
      console.log("SECOND", this.selectedRight)
      this.selectedRight = index
    }

    //match
    if(this.itemList[this.selectedLeft].match == this.itemList[this.selectedRight].match && this.selectedLeft != this.selectedRight){
      console.log("MATCH")
      //update Correct Mix and Match
      this.correctMixAndMatch[this.selectedLeft] = true
      this.correctMixAndMatch[this.selectedRight] = true
    }  else {
      console.log("INCORRECT")
      this.incorrectMixAndMatch.push(this.selectedLeft, this.selectedRight)
    }

    this.selectedRight = -1
    this.selectedLeft = -1
  }
}
