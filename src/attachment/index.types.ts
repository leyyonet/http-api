import {PropertyReflectionLike} from "@leyyo/core";
import {ControllerItem} from "../controller";

export interface AttachmentProcessorLike {
    attachedFields: Set<PropertyReflectionLike>;

    newItem(item: ControllerItem, path: string, fieldRef?: PropertyReflectionLike): AttachmentItem;

    clear(): void;

    fetchAttachments(): void;
}

export interface AttachmentItem {
    item: ControllerItem;
    fieldRef?: PropertyReflectionLike;
    path: string;
}
