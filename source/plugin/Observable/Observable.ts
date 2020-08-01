type ObserverData = any; // temp
type ObserverMethod = (data?: ObserverData) => void;

abstract class Observable {
  private observers: ObserverMethod[] = [];

  public addObserver(observer: ObserverMethod): void {
    this.observers.push(observer);
  }

  public removeObserver(observer: ObserverMethod): void {
    this.observers.filter((obs) => obs !== observer);
  }

  public notifyObservers(data?: ObserverData): void {
    const observersSnapshot = [...this.observers];
    observersSnapshot.forEach((obs) => obs(data));
  }
}

export default Observable;
