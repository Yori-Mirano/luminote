import { Strip } from "../../Strip";
import { Note } from "../../Note.model";

export interface OnInit {
  onInit(): void;
}

export abstract class StripBehavior {

  constructor(protected strip: Strip, protected notes: Note[]) {
    this.init();
  }

  init() {
    if ((<OnInit><unknown>this).onInit) {
      (<OnInit><unknown>this).onInit();
    }
  }

  tick() {
    this.onTick();
  }

  abstract onTick(): void;

}
