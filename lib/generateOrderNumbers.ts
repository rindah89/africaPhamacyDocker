export function generateOrderNumber(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let orderNumber = "";
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      orderNumber += characters[randomIndex];
    }
    return orderNumber;
  }
  