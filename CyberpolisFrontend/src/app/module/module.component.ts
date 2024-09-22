import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';

import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import { ModuleService } from '../module.service';
import { ActivatedRoute, Router } from '@angular/router';

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

  code: string = 'print("hello world")'; // Initial code to display in the editor
  moduleId: String = ''
  moduleInfo: any = {}
  content = ""

  editorOptions = {
    fontSize: '16px',
    showLineNumbers: true,
    tabSize: 4,
  };

  constructor(private moduleService: ModuleService, public router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe({
      next: this.getModuleId.bind(this)
    })

    this.moduleService.getModule(this.moduleId).subscribe({
      next: this.handleModuleInfo.bind(this),
      error: this.handleError.bind(this)
    })

    
  }

  getModuleId(routeInfo: any){
    this.moduleId = routeInfo['module_id'];
  }

  handleModuleInfo(data: any){
    this.moduleInfo = data;
    this.code = this.moduleInfo.initialModuleCode;
  }

  handleError(error: any){
    console.log(error)
  }

  goToCourse(){
    this.router.navigate(['course', this.moduleInfo.course.courseId, this.moduleInfo.course.courseName])
  }
  
  onCodeChanged(event: any) {
    console.log('Code changed:', event);
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
      console.log("keyup")
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  sendMessage() {
    const inputElement = this.chatInput.nativeElement;
    const message = inputElement.value.trim();
    if (message) {
      this.messages.push(message);
      inputElement.value = ''; // Clear the input after sending
    }
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

  run(){
    var pythonCode = ""
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

  // ... (keep your existing methods)

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


  convertMarkdown(){
    
  } 

}
