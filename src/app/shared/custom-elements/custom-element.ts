export interface CustomElement {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;

  /* You have to declare the attributes you want to observe:
   * static observedAttributes = ['attribute-a', 'attribute-b'];
   */
  attributeChangedCallback?(name: string, oldValue: string, newValue: string): void;
}
