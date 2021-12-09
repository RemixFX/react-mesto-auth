import React from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import api from '../utils/api';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import PopupWithForm from './PopupWithForm';
import EditProfilePopup from './EditProfilePopup';
import ImagePopup from './ImagePopup';
import EditAvatarPopups from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import FormValidator from './FormValidator';
import { settings } from '../utils/utils';


function App() {
  const [cards, setCards] = React.useState([]);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [isConfirmDeletePopupOpen, setIsConfirmDeletePopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({ name: '', link: '' });
  const [forDeleteCard, setForDeleteCard] = React.useState([])

  // Получение контекста текущего профиля
  const [currentUser, setCurrentUser] = React.useState({
    avatar: '',
    name: '',
    about: '',
    _id: ''
  })

  // Получение данных профиля с сервера
  React.useEffect(() => {
    api.getUserData().then(res => setCurrentUser(res))
      .catch((err) => console.log(err))
  }, []);

  // Получение карточек с сервера
  React.useEffect(() => {
    api.getInitialCards().then((res) => {
      setCards(res)
    })
      .catch(err => console.log(err))
  }, []);

  // Включение валидации для формы редактирования текстовых полей профиля
  React.useEffect(() => {
    const profileEditValidator = new FormValidator(settings, document.forms.profileEdit);
    profileEditValidator.enableValidation()
  }, []);

  // Включение валидации для формы добавления карточки
  React.useEffect(() => {
    const cardAddValidator = new FormValidator(settings, document.forms.cardAdd);
    cardAddValidator.enableValidation()
  }, []);

  // Включение валидации для формы редактирования аватара профиля
  React.useEffect(() => {
    const avatarEditValidator = new FormValidator(settings, document.forms.avatarEdit);
    avatarEditValidator.enableValidation()
  }, []);

  // Очистка ошибок валидации для формы редактирования текстовых полей профиля
  React.useEffect(() => {
    const profileEditValidator = new FormValidator(settings, document.forms.profileEdit);
    profileEditValidator.resetValidation()
  }, [isEditProfilePopupOpen]);

  // Очистка ошибок валидации для формы добавления карточки
  React.useEffect(() => {
    const cardAddValidator = new FormValidator(settings, document.forms.cardAdd);
    cardAddValidator.resetValidation()
  }, [isAddPlacePopupOpen]);

  // Очистка ошибок валидации для формы редактирования аватара профиля
  React.useEffect(() => {
    const avatarEditValidator = new FormValidator(settings, document.forms.avatarEdit);
    avatarEditValidator.resetValidation()
  }, [isEditAvatarPopupOpen]);

  // Постановка лайка
  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    api.changeLikeCardStatus(card._id, isLiked).then((newCard) => {
      setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
    })
      .catch(err => console.log(err));
  }

  // Добавление удаляемой карточки в стейт и открытие попапа подтверждения удаления
  function handleConfirmDeleteCardPopupOpen(card) {
    setForDeleteCard(card);
    setIsConfirmDeletePopupOpen(true)
  }

  // Удаление карточки
  function handleCardDelete(evt) {
    evt.preventDefault();

    api.deleteCard(forDeleteCard._id).then(() => {
      setCards((state) => state.filter((c) => c._id !== forDeleteCard._id))
      closeAllPopups();
    })
      .catch(err => console.log(err))
  }

  // Единая функция закрытия попапов
  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setSelectedCard({ name: '', link: '' });
    setIsConfirmDeletePopupOpen(false)
  }

  // Закрытие попапов по клавише Escape
  React.useEffect(() => {
    if (isEditProfilePopupOpen || isAddPlacePopupOpen || isEditAvatarPopupOpen
      || isConfirmDeletePopupOpen === true || selectedCard.link) {
      function handleEsc(evt) {
        if (evt.key === 'Escape') {
          closeAllPopups()
        }
      }

      document.addEventListener("keydown", handleEsc)

      return () => {
        document.removeEventListener("keydown", handleEsc)
      }
    }
  }, [isEditProfilePopupOpen, isAddPlacePopupOpen, isEditAvatarPopupOpen,
    isConfirmDeletePopupOpen, selectedCard.link])

  // Закрытие попапа по клике на область
  function handlePopupClick(evt) {
    if (evt.target.classList.contains("popup")) {
      closeAllPopups()
    }
  }

  // Открытие попапа с картинкой
  function handleCardClick(card) {
    setSelectedCard(card)
  }

  // Обновление текстовых полей профиля
  function handleUpdateUser(userInfo) {
    api.patchUserData(userInfo).then(res => {
      setCurrentUser(res)
      closeAllPopups()
    })
      .catch((err) => console.log(err));
  }

  // Обновление аватара профиля
  function handleUpdateAvatar(avatar) {
    api.patchUserAvatar(avatar).then(res => {
      setCurrentUser(res)
      closeAllPopups()
    })
      .catch((err) => console.log(err));
  }

  // Добавление новой карточки
  function handleAddPlaceSubmit(cardData) {
    api.uploadNewCard(cardData).then(newCard => {
      setCards([newCard, ...cards])
      closeAllPopups()
    })
      .catch((err) => console.log(err));
  }

  return (
    <div className="page">
      <CurrentUserContext.Provider value={currentUser}>
        <Header />
        <Main
          onEditProfile={() => setIsEditProfilePopupOpen(!isEditProfilePopupOpen)}
          onAddPlace={() => setIsAddPlacePopupOpen(!isAddPlacePopupOpen)}
          onEditAvatar={() => setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen)}
          cards={cards}
          onCardClick={handleCardClick}
          onCardLike={handleCardLike}
          onCardDelete={handleConfirmDeleteCardPopupOpen} />

        <Footer />

        <EditProfilePopup name="profileEdit" isOpen={isEditProfilePopupOpen} onClose={closeAllPopups}
          onPopupClick={handlePopupClick} onUpdateUser={handleUpdateUser} />

        <AddPlacePopup name="cardAdd" isOpen={isAddPlacePopupOpen} onClose={closeAllPopups}
          onPopupClick={handlePopupClick} onAddPlace={handleAddPlaceSubmit} />

        <EditAvatarPopups name="avatarEdit" isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups}
          onPopupClick={handlePopupClick} onUpdateAvatar={handleUpdateAvatar} />

        <PopupWithForm title="Вы уверены?" name="confirmation" buttonText='Да'
          class={'form__confirmation-button'} onPopupClick={handlePopupClick}
          isOpen={isConfirmDeletePopupOpen ? 'popup_opened' : ''}
          onClose={closeAllPopups} onSubmitForm={handleCardDelete} />

        <ImagePopup
          isOpen={selectedCard.link ? 'popup_opened' : ''}
          onClose={closeAllPopups}
          card={selectedCard}
          onPopupClick={handlePopupClick}
        />
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
