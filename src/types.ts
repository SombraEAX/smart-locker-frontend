export interface Ui {
  jump(page: string, direction?: string): void
  setFooter?(text: string): void
}
