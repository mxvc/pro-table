import {registerField} from "./valueType";
import FieldCheckboxBoolean from "./FieldCheckboxBoolean";
import FieldText from "./FieldText";

export function registerAllField(){
    registerField('text', FieldText);
    registerField('boolean', FieldCheckboxBoolean);
}

