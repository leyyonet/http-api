import {PropertyReflectionLike} from "@leyyo/core";
import {ControllerItem} from "../controller";

export interface AttachmentProcessorLike {
    attachedFields: Set<PropertyReflectionLike>;

    newItem(item: ControllerItem, fieldRef?: PropertyReflectionLike): AttachmentItem;

    clear(): void;

    fetchAttachments(): void;
    printDeploy(): void;
}

export interface AttachmentItem {
    controllerItem: ControllerItem;
    fieldRef?: PropertyReflectionLike;
}
