import React from "react";
import PopupWithForm from "./PopupWithForm";

function AddPlacePopup(props) {
  const [name, setName] = React.useState('');
  const [link, setLink] = React.useState('');

  function handleChangeName(evt) {
    setName(evt.target.value)
  }
  function handleChangeLink(evt) {
    setLink(evt.target.value)
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    props.onAddPlace({name, link});
  }

  React.useEffect(() => {
    setName('');
    setLink('');
  }, [props.isOpen]);

  return (
    <PopupWithForm title="Новое место" name={props.name} buttonText='Создать'
      isOpen={props.isOpen ? 'popup_opened' : ''} onSubmitForm={handleSubmit}
      onClose={props.onClose} onPopupClick={props.onPopupClick}>
      <fieldset className="form__field">
        <input type="text" autoComplete="off" name="name" id="title" placeholder="Название"
          required minLength="2" maxLength="30" className="form__input form__input_type_name-card"
          value={name} onChange={handleChangeName} />
        <span id="title-error" className="form__error"></span>
        <input type="url" autoComplete="off" name="link" id="link" placeholder="Ссылка на картинку"
          required className="form__input form__input_type_link"
          value={link} onChange={handleChangeLink} />
        <span id="link-error" className="form__error"></span>
      </fieldset>
    </PopupWithForm>
  )
}

export default AddPlacePopup;
