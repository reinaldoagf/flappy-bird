import { Component, ElementRef, HostListener, ViewChild } from '@angular/core'
import { RANDOM, WINDOW_INNER_WIDTH, ELEMENT_SIZE, FLOOR_HEIGHT, PLAY_AREA_HEIGHT } from '../../consts'

@Component({
  selector: 'app-flappy-bird',
  templateUrl: './flappy-bird.component.html',
  styleUrls: ['./flappy-bird.component.scss']
})

export class FlappyBirdComponent {
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      this.elements.bird.dy -= 80;
      // Agrega aquí cualquier otra lógica que necesites ejecutar
    }
  }

  @ViewChild('canvas', { static: true }) canvasElementRef: ElementRef | null  = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private dpi: number | null = null;

  elements: any = {
    background: {
      src: 'assets/img/fondo.png',
      imagen: null,
      dx: 0,
      dy: 0,
      dWidth: 0,
      dHeight: 0
    },
    bird: {
      src: 'assets/img/bird.png',
      imagen: null,
      dx: this.canvasElementRef ? (this.canvasElementRef.nativeElement.clientWidth * 0.1) - (ELEMENT_SIZE / 2) : 0,
      dy: this.canvasElementRef ? (this.canvasElementRef.nativeElement.clientHeight * 0.1) : 0,
      dWidth: ELEMENT_SIZE - 40,
      dHeight: ELEMENT_SIZE - 50,
    },
    pipelines: [{
      dx: ELEMENT_SIZE * 6,
      src: 'assets/img/tuberia-top.png',
      imagen: null,
      dy: -RANDOM,
      dWidth: ELEMENT_SIZE,
      dHeight: ELEMENT_SIZE * 5,
    },{
      dx: ELEMENT_SIZE * 6,
      src: 'assets/img/tuberia-bottom.png',
      imagen: null,
      dy: PLAY_AREA_HEIGHT - RANDOM - ELEMENT_SIZE,
      dWidth: ELEMENT_SIZE,
      dHeight: ELEMENT_SIZE * 5 ,
    }],
    floor: {
      src: 'assets/img/floor.png',
      imagen: null,
      dx: 0,
      dy: PLAY_AREA_HEIGHT - FLOOR_HEIGHT,
      dWidth: WINDOW_INNER_WIDTH,
      dHeight: FLOOR_HEIGHT,
    }
  }
  lastTime = 0 
  dropCounter = 0
  gameOver: boolean = false
  pipelinesImages: any = {
    top: null,
    bottom: null
  }
  // ... otras variables aquí

  ngOnInit() {
    this.initCanvas();
    this.loadElements();
  }
  async loadElement(element: any) {
    return new Promise((resolve, reject) => {
      const imagen = new Image();
      imagen.src = element.src;
      imagen.onload = () => {
        element.imagen = imagen;
        this.pipelinesImages.top = element.src == 'assets/img/tuberia-top.png' ? imagen : this.pipelinesImages.top
        this.pipelinesImages.bottom = element.src == 'assets/img/tuberia-bottom.png' ? imagen : this.pipelinesImages.bottom
        resolve(true);
      };
      imagen.onerror = reject;
    });
  }
  
  async loadElements() {  
    const promises = [];
    for (const key in this.elements) {
      if (this.elements[key].src) {
        promises.push(this.loadElement(this.elements[key]));
      }
      if(key === 'pipelines') {      
        for (const element of this.elements[key]) {
          promises.push(this.loadElement(element));
        }
      }
    }
  
    await Promise.all(promises);
    this.update();
  }
  private initCanvas(): void {
    if(this.canvasElementRef) {
      
      const $canvas: HTMLCanvasElement = this.canvasElementRef.nativeElement;
      this.ctx = $canvas.getContext('2d');
      if(this.ctx) {
        this.ctx.imageSmoothingEnabled = true;
  
        this.dpi = window.devicePixelRatio - (window.devicePixelRatio * 0.1);
        $canvas.width = $canvas.clientWidth * this.dpi;
        $canvas.height = $canvas.clientHeight * this.dpi;
      }
    }
  }

  // ... otras funciones aquí

  private drawElement(element: any): void {
    if (element.imagen) {
      if(this.ctx) {
        this.ctx.drawImage(
          element.imagen,
          element.dx,
          element.dy,
          element.dWidth,
          element.dHeight
        );
      }
    }
  }
  checkCollision() {
    return (this.elements.bird.dy + (ELEMENT_SIZE + 40)) >= PLAY_AREA_HEIGHT
  }
  generatePipelines() {
    const random = Math.floor(Math.random() * 300) 
    this.elements.pipelines = [...this.elements.pipelines,{
      dx: this.elements.pipelines[this.elements.pipelines.length - 1].dx + 400,
      src: 'assets/img/tuberia-top.png',
      imagen: this.pipelinesImages.top,
      dy: random * -1,
      dWidth: ELEMENT_SIZE,
      dHeight: ELEMENT_SIZE * 5,
    },{
      dx: this.elements.pipelines[this.elements.pipelines.length - 1].dx    + 400,
      src: 'assets/img/tuberia-bottom.png',
      imagen: this.pipelinesImages.bottom,
      dy: PLAY_AREA_HEIGHT - random - ELEMENT_SIZE,
      dWidth: ELEMENT_SIZE,
      dHeight: ELEMENT_SIZE * 5,
    }] 
  }
  
  drawElements() {
    if(this.elements.background) {
      if(this.canvasElementRef) {
      const $canvas: HTMLCanvasElement = this.canvasElementRef.nativeElement;
      const dpi = window.devicePixelRatio - (window.devicePixelRatio * 0.1);
      $canvas.width = $canvas.clientWidth * dpi;
      $canvas.height = $canvas.clientHeight * dpi;
      this.elements.background.dWidth = $canvas.width
      this.elements.background.dHeight = $canvas.height 
      this.drawElement(this.elements.background)
      } 
    } 
  
    if(this.elements.bird) {
      this.drawElement(this.elements.bird)
    }
    
    for (const element of this.elements.pipelines) {
      this.drawElement(element)    
    }  
  
    if(this.elements.floor) {
      this.drawElement(this.elements.floor)    
    }
  }
  update(time = 0) {
    if (!this.gameOver) {
      const deltaTime = time - this.lastTime;
      this.lastTime = time;
  
      this.dropCounter += deltaTime;
      for (const pipeline of this.elements.pipelines) {
        pipeline.dx -= 5;
      }
  
      this.elements.bird.dy += 5;
      this.gameOver = this.checkCollision();
      if (this.gameOver) {
        alert('game over');
      }
  
      if (this.dropCounter > 1000) {
        this.dropCounter = 0;
        this.generatePipelines();
      }
  
      this.drawElements();
      window.requestAnimationFrame((currentTime) => this.update(currentTime)); // Usar una función de flecha para mantener el contexto de "this"
    }
  }
  // ... otras funciones aquí
}
