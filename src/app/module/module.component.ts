import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';

import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import { ModuleService } from '../module.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModuleService } from '../user-module.service';
import { ChatService } from '../chat.service';

import * as d3 from 'd3';
import { LinearRegressionCostComponent } from '../interactive/linear-regression-cost/linear-regression-cost.component';


@Component({
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrl: './module.component.css'
})
export class ModuleComponent implements OnInit, AfterViewInit {
  isBrowser: any;
  chatbotHelpHidden: boolean = true
  messages: string[] = []
  @ViewChild('chatInput') chatInput!: ElementRef;
  questions: any[] = [
    
  ];

  code: string = ''; // Initial code to display in the editor
  moduleId: String = ''
  moduleInfo: any = {}
  userModuleInfo: any = {}
  content = ""
  highlightButtonTop = -1
  highlightButtonLeft = -1
  highlight = ""
  highlights: String[] = []
  message: String = ""

  editorOptions = {
    fontSize: '16px',
    showLineNumbers: true,
    tabSize: 4,
  };

  constructor(
    private moduleService: ModuleService,
     public router: Router, private route: ActivatedRoute,
    private userModuleService: UserModuleService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    
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

  handleModuleInfo(data: any){
    this.moduleInfo = data;
    //Code
    for(var i=0; i<this.moduleInfo.initialModuleCode.length; i++ ){
      this.code += this.moduleInfo.initialModuleCode[i] + "\n"
    }

    //Questions
    for(var i=0; i<this.moduleInfo.questions.length; i++){
      let question = {
        "question": this.moduleInfo.questions[i]['question'],
        "choices": this.moduleInfo.questions[i]['choices'],
        "answer": this.moduleInfo.questions[i]['answer'],
        "explanation": this.moduleInfo.questions[i]['explanation'],
        "selectedChoice": "",
        "incorrectChoices": [],
      }
      this.questions.push(question)
    }
    console.log(this.moduleInfo)
  }

  handleUserModuleInfo(data: any){

    //first time visit
    if(data === null){
      this.userModuleService.addUserModuleRelation(this.moduleId).subscribe({
        next: this.handleUserModuleInfo.bind(this),
        error: this.handleError.bind(this)
      })
      return
    }

    this.userModuleInfo = data

    console.log(this.userModuleInfo)

    //questions
    for(var i =0; i<this.userModuleInfo.questionsCorrect.length; i++){
      if(this.userModuleInfo.questionsCorrect[i]){
        this.questions[i].correct = true
        this.questions[i].selectedChoice = this.questions[i].answer
      }
    }
  }

  handleError(error: any){
    console.log(error)
  }

  goToCourse(){
    this.router.navigate(['course', this.moduleInfo.course.courseId, this.moduleInfo.course.courseName])
  }
  
  onCodeChanged(event: any) {
    console.log(this.code.split("\n")[0]);
  }

  runCode(){
    this.userModuleService.runCode(this.code.split("\n"), this.moduleId).subscribe({
      next: this.handleCodeSubmission.bind(this),
      error: this.handleError.bind(this)
    })
  }

  handleCodeSubmission(response: any){
    console.log(response)
  }
  
  // Block bank with predefined blocks
  blockBank: any[] = [{
    'text': 'for every number between 1 and 10:', 
    'value': 'for i in range(10):'
  }, {
    'text': 'if var is True:', 
    'value': 'if var == True'
  }];

  // Active blocks list
  activeBlocks: any[] = [];

  ngAfterViewInit(): void {
    this.chatInput.nativeElement.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  onMessageChanged(){
    console.log(this.message)
    if(this.message[this.message.length-1] == '@'){
      console.log("Adawd")
    }
  }

  sendMessage() {
    const inputElement = this.chatInput.nativeElement;
    const message = inputElement.value.trim();
    if (message) {
      this.messages.push(message);
      inputElement.value = ''; 
    }
    
    this.chatService.sendMessage(this.moduleId, message, []).subscribe({
      next: this.handleNewChatMessage.bind(this),
      error: this.handleError.bind(this)
    })

  }

  handleNewChatMessage(data: any){
    console.log(data)
  }

  onTextSelect(data: any){
    var selection = window.getSelection();
    if (selection && selection.toString()) {
      this.highlight = selection.toString() 
      const range = selection.getRangeAt(0).getBoundingClientRect();
      this.highlightButtonTop = range.top + window.scrollY - 30; 
      this.highlightButtonLeft = range.left + window.scrollX;
    } else {
      this.highlight = ""
    }
  }

  saveHighlight(){
    console.log(this.highlight)
    this.highlights.push(this.highlight)
    this.highlight = ""
    // window.open("https://localhost:4200/home", "_blank");  
  }

  

  // Handle the drop event
  drop(event:any, targetList: string) {
    if(!event.isPointerOverContainer){
      if(targetList === 'active'){
        this.blockBank.push(this.activeBlocks.splice(parseInt(event.item.element.nativeElement.id), 1)[0])
      }
    }

    //from bank to active
    if (targetList === 'active') {
      //if moving block within active section
      if (event.previousContainer.data == event.container.data){
        moveItemInArray(this.activeBlocks, event.previousIndex, event.currentIndex);
        return
      }

      // When dropped from bank into the active list
      this.activeBlocks.push(this.blockBank.splice(parseInt(event.item.element.nativeElement.id), 1)[0])
      return
    }

    //if moving within bank 
    if (event.previousContainer.data == event.container.data){
      moveItemInArray(this.blockBank, event.previousIndex, event.currentIndex);
      return
    }
    //Dropping into bank
    this.blockBank.push(this.activeBlocks.splice(parseInt(event.item.element.nativeElement.id), 1)[0])
  }

  selected: string = 'block';

  selectTab(tab: string) {
    this.selected = tab;
  }

  @ViewChild('chatbotPopup') chatbotPopup!: ElementRef;
  chatbotHeight: number = 300; // Initial height
  isDragging: boolean = false;

  onResizeStart(event: MouseEvent) {
    this.isDragging = true;
    event.preventDefault();
    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  onResize = (event: MouseEvent) => {
    if (this.isDragging) {
      const newHeight = window.innerHeight - event.clientY;
      this.chatbotHeight = Math.max(100, Math.min(newHeight, window.innerHeight - 100));
    }
  }

  onResizeEnd = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }

  @ViewChild('contentSection') contentSection!: ElementRef;
  @ViewChild('workSection') workSection!: ElementRef;
  
  isDraggingDivider: boolean = false;
  contentWidth: number = 50; // Initial width percentage

  onDividerResizeStart(event: MouseEvent) {
    this.isDraggingDivider = true;
    event.preventDefault();
    document.addEventListener('mousemove', this.onDividerResize);
    document.addEventListener('mouseup', this.onDividerResizeEnd);
  }

  onDividerResize = (event: MouseEvent) => {
    if (this.isDraggingDivider) {
      const containerWidth = this.contentSection.nativeElement.parentElement.offsetWidth;
      const newContentWidth = (event.clientX / containerWidth) * 100;
      this.contentWidth = Math.max(20, Math.min(newContentWidth, 80)); // Limit between 20% and 80%
    }
  }

  onDividerResizeEnd = () => {
    this.isDraggingDivider = false;
    document.removeEventListener('mousemove', this.onDividerResize);
    document.removeEventListener('mouseup', this.onDividerResizeEnd);
  }


  selectChoice(questionIndex: number, choice: String) {
    this.questions[questionIndex]['selectedChoice'] = choice;
  }

  checkAnswer(questionIndex: number) {
    console.log(this.questions[questionIndex]['answer'])
    if (this.questions[questionIndex]['selectedChoice'] == this.questions[questionIndex]['answer']){
      this.userModuleInfo.questionsCorrect[questionIndex] = true;
      this.userModuleService.updateCorrectQuestion(this.moduleId, this.userModuleInfo.questionsCorrect).subscribe({
        next: this.handleCorrectAnswer.bind(this),
        error: this.handleError.bind(this)
      })
    }
    this.questions[questionIndex].incorrectChoices.push(this.questions[questionIndex].selectedChoice)
    console.log(this.questions[questionIndex].incorrectChoices)
  }

  handleCorrectAnswer(data: any){
    this.userModuleInfo.questionsCorrect = data
    console.log(data == this.userModuleInfo.questionsCorrect)
  }


}
