import type { SourceEvent } from "./mod.ts";
import { LINEEventBase } from "./shared.ts";

/**
 * An event that indicates a message has been read.
 */
export class ReadMessageLINEEvent extends LINEEventBase {
  type: "read-message" = "read-message";

  /**
   * The mid of the user who read the message.
   * This is a placeholder property and will be replaced in the future.
   */
  readonly readUserMid: string;
  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    this.readUserMid = source.event.param1
  }
}
