import type * as LINETypes from "@evex/linejs-types";

export type SquaerStatus =
    & LINETypes.SquareEventNotifiedUpdateSquareChatStatus
    & LINETypes.SquareEventNotifiedUpdateSquareChatStatus["statusWithoutMessage"];
