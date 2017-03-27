'use strict'

const moment = require('moment'); // подключаем библиотеку moment.js для работы с датами и временем

class Mobilization {

  constructor(setup) {

    // Инициализируем основные массивы для сущностей
    this.schools = [];
    this.lectures = [];
    this.places = [];

    if(setup) {
      if (setup.schools) { // Если в объекте инициализации есть школы
        let schoolsNotAdded = []; // Инициализируем массив для школ, которые не пройдут проверку
        setup.schools.forEach((school) => { // Каждую школу в объекте инициализации
          this.addSchool(school, true) ? null : schoolsNotAdded.push(school.name); // Прогоняем через метод, добавляющий школу (в тихом режиме), и если тот возвращает false, добавляем школу в массив школ, не прошедших проверку
        })
        schoolsNotAdded.length ? console.warn('Школы ' + schoolsNotAdded.join(', ') + ' не добавлены, перепроверьте данные.') : console.info('Все школы инициализированы'); // Говорим, все ли школы инициализированы. Если нет - перечисляе их названия.
      }
      if (setup.places) { // Полностью аналогично с аудиториями
        let placesNotAdded = [];
        setup.places.forEach((place) => {
          this.addPlace(place, true) ? null : placesNotAdded.push(place.name);
        });
        placesNotAdded.length ? console.warn('Аудитории ' + placesNotAdded.join(', ') + ' не добавлены, перепроверьте данные.') : console.info('Все аудитории инициализированы');
      }
      if (setup.lectures) { // И точно также с лекциями. Добавляем их в последнюю очередь, чтобы проверить все связи со школами и аудиториями.
        let lecturesNotAdded = [];
        setup.lectures.forEach((lecture) => {
          this.addLecture(lecture, true) ? null : lecturesNotAdded.push(lecture.name);
        });
        lecturesNotAdded.length ? console.warn('Лекции ' + lecturesNotAdded.join(', ') + ' не добавлены, перепроверьте данные.') : console.info('Лекции инициализированы');
      }
      console.info('Объект проекта "Мобилизация" успешно инициализирован');
    }
  }

  /* Методы, относящиеся к лекциям */

  addLecture(lecture, silent) {
    if(this.checkLecture(lecture)) { // Проверяем объект lecture на соответствие требованиям к лекциям
      if(this.placeIsCapable(lecture.place, lecture.schools)) { // Проверяем, вмещает ли аудитория студентов всех школ, к которым относится лекция
        if(this.placeIsFree(lecture.place, lecture.dateFrom, lecture.duration)) { // Проверяем, не занята ли аудитория в это время
          this.lectures.push(lecture); // Добавляем лекцию в наш объект
          silent || console.info('Лекция "' + lecture.name + '" добавлена успешно'); // Выводим сообщение, если метод запущен не в "тихом" режиме
          return true; // Возвращаем true если лекция добавлена
        }
        else { // Если аудитория занята
          silent || console.error('Ошибка: аудитория "' + lecture.place + '" в желаемое время занята, добавление лекции "' + lecture.name + '" невозможно.')
          return false; // Не добавляем лекцию и возвращаем false.
        }
      }
      else { // Если аудитория недостаточно вместительна
        silent || console.error('Ошибка: в аудитории "' + lecture.place + '" недостаточно мест, добавление лекции "' + lecture.name + '" невозможно.')
        return false; // Не добавляем лекцию и возвращаем false.
      }
    }
    else { // Если лекция не прошла проверку
      silent || console.error('Ошибка: лекция "' + lecture.name + '" не добавлена, проверьте данные.')
      return false; // Не добавляем лекцию и возвращаем false.
    }
  }

  deleteLecture(lectureName, silent, editor) {
    let lectureToDelete = this.getLecture(lectureName); // Находим лекцию по названию
    if(!lectureToDelete) { // Если такой нет,
      console.error('Ошибка: Лекция "' + lectureName + '" не существует'); // Выводим ошибку
      return false; // И возвращаем false
    }
    this.lectures.splice(this.lectures.indexOf(lectureToDelete), 1); // Иначе убираем лекцию из объекта
    silent || console.info('Лекция "' + lectureName + '" успешно удалена') // Сообщаем об успехе (не в тихом режиме)
    return true; // Возвращаем true, чтобы показать, что лекция удалена
  }

  editLecture(lectureName, changes, silent) {
    let lectureToChange = this.getLecture(lectureName); // Находим лекцию по названию
    let lectureClone = JSON.parse(JSON.stringify(lectureToChange)); // Клонируем эту лекцию
    if(changes && lectureToChange) { // если объект с изменениями введён и найдена лекция, которую надо изменить
      let lectureProperties = ['name', 'lecturer', 'dateFrom', 'duration', 'place', 'schools']; // Задаём список свойств лекции, которые могут быть изменены
      for (var lectureProp in changes) { // прогоняемся по всем свойствам объекта с изменениями
        if (changes.hasOwnProperty(lectureProp) && lectureProperties.indexOf(lectureProp) !== -1) { // и если имена свойств этого объекта есть в массиве lectureProperties
          lectureClone[lectureProp] = changes[lectureProp]; // Заполняем клон лекции новыми данными
        }
      }
    }
    else if(!lectureToChange){ // Если же лекция, которую надо изменить не найдена
      silent || console.error('Ошибка: Лекция "' + schoolName + '" не найдена') // Сообщаем об этом (не в тихом режиме)
      return false; // и возвращаем false
    }
    if (this.checkLecture(lectureClone, true)) { // Проверяем наш клон на пригодность
      // TODO: Проверять место, указанное в клоне, иначе удалённую лекцию мы уже не вернём
      this.deleteLecture(lectureName, true, true); // Удаляем существующую лекцию в тихом режиме
      this.addLecture(lectureClone, true); // И добавляем новую
      silent || console.info('Лекция "' + lectureName + '" изменена. Теперь она называется "' + lectureClone.name + '"'); // Докладываем об успехе
      return true; // Возвращаем true
    }
    else { // Если же клон непригоден
      silent || console.error('Изменения, внесённые в лекцию "' + lectureName + '" недопустимы. Исправьте ошибки и попробуйте снова.'); // Говорим об ошибке
      return false; // Возвращаем false
    }
  }

  getLecture(name) {
    return this.lectures.find((lecture) => { // Находим лекцию в массиве с лекциями
      if(lecture.name === name) {
        return lecture; // Возвращаем её, если имя совпадает с тем, которое ищут
      }
      return false; // иначе возвращаем false
    }) || false; // возвращаем false, если лекцию не нашли
  }

  checkLecture(lecture, editor) {
    if ( // Проверяем лекцию
      (typeof lecture.name === 'string' || lecture.name instanceof String) && // является ли имя строкой
      (typeof lecture.lecturer === 'string' || lecture.name instanceof String) && // является ли имя лектора строкой
      (typeof lecture.duration === 'number' || lecture.duration instanceof Number) && // является ли длительность числом
      this.getPlace(lecture.place) && // Есть ли такая аудитория
      lecture.schools.length && // Не пустой ли массив школ
      lecture.schools.every((school) => { return this.getSchool(school) }) && // убеждаемся, что все школы существуют
      moment(lecture.dateFrom).isValid() // и что дата-время начала лекции в правильном формате (YYYY-MM-DD hh:mm)
    ){
      if(!this.getLecture(lecture.name) || editor) { // проверяем, существует ли лекция с таким названием (или если метод запустил метод-редактор)
        return true; // возвращаем true
      }
    }
    return false;
  }

  /* Методы, относящиеся к школам */

  addSchool(school, silent) {
    if(this.checkSchool(school)) { // Если школа соответствует формату
      this.schools.push(school); // Кладём школу в массив школ
      silent || console.info('Школа "' + school.name + '" успешно добавлена')
      return true;
    }
    else {
      silent || console.error('Ошибка: школа "' + school.name + '" не добавлена, проверьте данные');
      return false; // возвращаем false, чтобы показать, что школа не добавлена
    }
  }

  deleteSchool(schoolName, silent, editor) {
    let schoolToDelete = this.getSchool(schoolName); // Находим школу с таким именем
    if(schoolToDelete) { // и если она существует
      !silent && !editor ? console.warn('При удалении школы будут удалены и лекции, проводимые только для этой школы') : null;
      if(!editor) { // если метод вызван не редактором школ
        let schoolLectures = this.lectures.filter((lecture) => { // находим все лекции для этой школы
          if (lecture.schools.indexOf(schoolName) !== -1) {
            return true;
          }
          return false;
        });
        schoolLectures.forEach((lecture) => {
          if(lecture.schools.length === 1) { // и если лекция проводится только для этой школы
            this.deleteLecture(lecture.name, true); // удаляем её
          }
          else { // иначе просто убираем эту школу из объекта лекции
            lecture.schools.splice(lecture.schools.indexOf(schoolName), 1);
          }
        });
      }
      this.schools.splice(this.schools.indexOf(schoolToDelete), 1); // удаляем школу из объекта
      silent || console.info('Школа "' + schoolName + '" успешно удалена');
      return true;
    }
    silent || console.error('Ошибка: школа "' + schoolName + '" не найдена, удаление невозможно');
    return false; // возвращаем false, если не удалили
  }

  editSchool(schoolName, changes, silent) {
    let schoolToChange = this.getSchool(schoolName); // Находим школу по её названию
    let schoolClone =  JSON.parse(JSON.stringify(schoolToChange)); // создаём её клон
    if(changes && schoolToChange) { // заполняем клон новыми данными, если существует и школа, и объект с изменениями
      if (changes.name) { // если они существуют
        schoolClone.name = changes.name;
      }
      if(changes.students) {
        schoolClone.students = changes.students;
      }
    }
    else if(!schoolToChange){ // если школа к редактированию не найдена
      silent || console.error('Ошибка: Школа "' + schoolName + '" не найдена')
      return false;
    }
    if(this.checkSchool(schoolClone, true)) { // Проверяем клон на соответствие формату
      let lecturesForSchool = schoolSchedule(schoolName); // И если всё правильно, находим все лекции для этой школы
      if (lecturesForSchool.length > 0) { // Проверяем, есть ли вообще такие лекции
        lecturesForSchool.forEach((lecture) => { // Для них подменяем название школы на новое
          let newSchools = lecture.schools.slice(0);
          newSchools.splice(lecture.schools.indexOf(schoolName), 1, schoolClone);

          if(!this.placeIsCapable(lecture.place, newSchools)){ // рассчитав при этом количество всех студентов для каждой из таких лекций и узнав, вместятся ли они все в соответствующие лекциям аудитории
            throw new Error('Ошибка: аудитория "' + lecture.place + '" не может вместить в себя ' + schoolClone.students + ' студентов'); // выдаём ошибку, если нет
          }

          lecture.schools[lecture.schools.indexOf(schoolName)] = schoolClone.name; // подменям школу
        })
      }
      this.deleteSchool(schoolName, true, true); // удаляем старый объект школы
      this.addSchool(schoolClone, true); // и добавляем новый
      !silent ?console.info('Школа "' + schoolName + '" изменена. Теперь она называется "' + schoolClone.name + '" и в ней ' + schoolClone.students + ' студентов ') : null; // говорим, какие же мы молодцы
      return true;
    }
  }

  getSchool(name) {
      return this.schools.find((school) => { // точно также, как и в getLecture, находим школу по имени.
        if (school.name === name) {
          return school;
        }
        return false;
      }) || false;
  }

  checkSchool(school, editor) {
    if (typeof school.name === 'string' && typeof school.students === 'number'
        && school.students >= 1) { // Если вся инфа о школах заполнена как надо, и такой уже школы не существует
      if(!this.getSchool(school.name) || editor) { // Если такой школы не существует (или если метод-редактор запустил этот метод)
        return true; // возвращаем true
      }
    }
    return false;
  }

  schoolSchedule(school, dateFrom, dateTo) {
    if (typeof school === 'string' || school instanceof String) { // если название школы - строка
      school = this.getSchool(school); // берём объект школы с соответствующим названием
    }
    let schedule = this.lectures.filter((lecture) => { // фильтруем лекции по принадлежности школе
      if (lecture.schools.indexOf(school.name) !== -1) {
        return true;
      }
      return false;
    });
    if (dateFrom && moment(dateFrom).isValid() && !dateTo) { // если начальная дата запроса задана
      schedule = schedule.filter((lecture) => { // выкидываем все лекции раньше этой даты
        if (moment(lecture.dateFrom).isSameOrAfter(dateFrom)) {
          return true;
        }
        return false;
      })
    }
    if (dateFrom && dateTo && moment(dateFrom).isValid() && moment(dateTo).isValid()) { // А если задана ещё и конечная дата запроса
      schedule = schedule.filter((lecture) => { // выкидываем вообще все лекции за пределами промежутка (промежуток включает начальную и конечную даты)
        if (moment(lecture.dateFrom).isBetween(dateFrom, dateTo, null, '[]')) {
          return true;
        }
        return false;
      })
    }

    schedule.sort((curr, next) => { // сортируем возвращаемые лекции в порядке возрастания даты (самые поздние - в конце)
      return moment(curr.dateFrom).isAfter(next.dateFrom);
    })
    return schedule; // возвращаем объект с лекциями
  }


  /* Аудитории */

  addPlace(place, silent) {
    if(this.checkPlace(place)) { // проверяем школу на соответствие формату
      this.places.push(place); // Кладём школу в массив школ
      silent || console.info('Аудитория "' + place.name + '" успешно добавлена')
      return true;
    }
    else { // если что-то не так, говорим об ошибке и возвращаем false
      silent || console.error('Ошибка: аудитория "' + place.name + '" не добавлена, проверьте данные')
      return false;
    }
  }

  deletePlace(placeName, silent, editor) {
    let placeToDelete = this.getPlace(placeName); // Находим аудиторию с таким названием
    if(placeToDelete) { // если такая нашлась

      if(!editor) { // и если метод вызван не редактором аудиторий
        silent || console.warn('При удалении аудитории будут удалены все лекции, проводимые в этой аудитории'); // мягко предупреждаем (хотя отказываться от этого будет уже поздно)

        let placeLectures = this.lectures.filter((lecture) => { // Находим все лекции в этой аудитории
          if (lecture.place === placeName) {
            return true;
          }
        });
        placeLectures.every((lecture) => {
          this.deleteLecture(lecture.name); // и удаляем их по одной
        })
      }

      this.places.splice(this.places.indexOf(placeToDelete),1); // вынимаем аудиторию из нашего объекта

      silent || console.info('Аудитория "' + placeName + '" успешно удалена'); // говорим, что мы молодцы и справились
      return true;
    }
    silent || console.error('Ошибка: Аудитория "' + placeName + '" не найдена'); // говорим, что такой аудитории и так нет
    return false;
  }

  editPlace(placeName, changes, silent) {
    let placeToChange = this.getPlace(placeName); // находим аудиторию по названию
    let placeClone =  JSON.parse(JSON.stringify(placeToChange)); // клонируем
    if(changes && placeToChange) { // заполняем клон соответствующими данными, если аудитория найдена
      if (placeClone.name) {
        placeClone.name = changes.name;
      }
      if (placeClone.capacity) {
        placeClone.capacity = changes.capacity;
      }
    }
    else if(!placeToChange){ // Если аудитория не нашлась, громко вопим об этом красным цветом и возвращаем false.
      silent || console.error('Ошибка: Аудитория "' + placeName + '" не найдена')
      return false;
    }

    if(this.checkPlace(placeClone, true)) { // Проверяем клон на соответствие формату
      let lecturesForPlace = this.placeSchedule(placeName); // ищем все лекции в редактируемой аудитории
      if (lecturesForPlace.length > 0) { // если таковые нашлись
        lecturesForPlace.forEach((lecture) => {

          if(!this.placeIsCapable(placeClone, lecture.schools)){ // если аудитория не вмещает в себя всех студентов каждой лекции
            let students;
            if (lecture.schools.length > 1) { // если школ больше одной
              students = lecture.schools.reduce((prev, next) => { // считаем суммарное количество студентов
                next = this.getSchool(next);
                if(typeof prev === 'string' || prev instanceof String) {
                  prev = this.getSchool(prev);
                }
                return prev.students + next.students;
              });
            }
            else { // если такая только одна
              students = this.getSchool(lecture.schools[0]).students; // просто записываем количество студентов в ней
            }
            throw new Error('Ошибка: аудитория "' + placeClone.name + '" не может вместить в себя ' + students + ' студентов'); // Кидаем ошибку
          }
          lecture.place = placeClone.name; // подменяем аудиторию в каждой лекции в ней
        })
      }
      this.deletePlace(placeName, true); // удаляем старый объект аудитории
      this.addPlace(placeClone, true); // создаём новый из клона
      silent || console.info('Аудитория "' + placeName + '" изменена. Теперь она называется "' + placeClone.name + '" и в неё помещается ' + placeClone.capacity + ' человек');
      return true;
    }
  }

  getPlace(name) {
    return this.places.find((place) => { // находим аудиторию по имени точно так же, как и школы в getSchool и лекции в getLecture
        if (place.name === name) {
          return place;
        }
        return false;
      }) || false;
  }

  checkPlace(place, editor) {
    if (typeof place.name === 'string' && typeof place.capacity === 'number'
        && place.capacity >= 1 && !this.getPlace(place.name)) { // Если вся инфа о школах заполнена как надо,
      if (!this.getPlace(place.name) || editor) { // и такой школы не существует (или если проверка запущена методом-редактором)
        return true;
      }
    }
    return false;
  }

  placeIsCapable(place, schools) {
    // проверяем, не попала ли случайно в первый параметр строка с названием аудитории
    if (typeof place === 'string' || place instanceof String) {
      place = this.getPlace(place); // если так и есть, пытаемся вернуть аудиторию с таким названием
    }

    schools = schools.map((school) => { // проверяем, все ли школы существуют и возвращаем в массив school объекты школ вместо их названий (если предоставленны именно названия)
      if(typeof school === 'string' || school instanceof String) {
        let newSchool = this.getSchool(school);
        if (newSchool) {
          return newSchool;
        }
        throw new Error('Школы "' + school + '" не существует');
      }
      else if(typeof school === 'object' || school instanceof Object) {
        return school;
      }
    });

    if (place.capacity >= schools.reduce((prev, current) => { // если школа вмещает в себя студентов всех школ
      return { students: prev.students + current.students }
    }).students) {
      return true; // возвращаем true
    }
    return false;
  }

  placeIsFree(place, dateFrom, duration) {
    if(typeof place === 'string' || place instanceof String) { // отыскиваем аудиторию по названию
      place = this.getPlace(place);
    }
    if(typeof dateFrom === 'string' || place instanceof String) {
      if (!moment(dateFrom).isValid()) { // проверяем дату и время на соответствие формату
        throw new Error('Неверный формат даты');
      }
      dateFrom = moment(dateFrom); // генерируем объект Moment
    }

    let dateTo = moment(dateFrom).add(duration, 'm'); // вычисляем дату и время оконачния требуемого срока бронирования аудитории

    let allLectures = this.placeSchedule(place, dateFrom, dateTo); // вытаскиваем лекции в этой аудитории в это время

    if(allLectures.length > 0) { // если такие есть - возвращаем false
      return false;
    }
    return true; // иначе true
  }

  placeSchedule(place, dateFrom, dateTo) {
    if (typeof place === 'string' || place instanceof String) { // находим аудиторию по названию
      place = this.getPlace(place);
    }
    let schedule = this.lectures.filter((lecture) => { // находим все лекции в этой аудитории
      if (lecture.place === place.name) {
        return true;
      }
      return false;
    });
    if (dateFrom && moment(dateFrom).isValid() && !dateTo) { // среди них выбираем только те, что проходят после начальной даты, если нет конечной даты
      schedule = schedule.filter((lecture) => {
        if (moment(lecture.dateFrom).isSameOrAfter(dateFrom)) {
          return true;
        }
        return false;
      })
    }
    if (dateFrom && dateTo && moment(dateFrom).isValid() && moment(dateTo).isValid()) { // или выбираем те, что проходят между начальной и конечной датами, если конечная задана
      schedule = schedule.filter((lecture) => {
        if (moment(lecture.dateFrom).isBetween(dateFrom, dateTo, null, '[]')) {
          return true;
        }
        return false;
      })
    }

    schedule.sort((curr, next) => { // сортируем по возрастанию даты (самые поздние - в конце)
      return moment(curr.dateFrom).isAfter(next.dateFrom);
    })
    return schedule; // возвращаем полученный массив
  }

  /* Методы импорта и экспорта */

  exportJSON() { // экспортирует три основных массива объекта в JSON
    return JSON.stringify({
      schools: this.schools,
      places: this.places,
      lectures: this.lectures
    });
  }

  static importJSON(json) {
    // создаёт новый инстанс класса из предоставленного JSON-объекта
    let parsed = JSON.parse(json);
    let imported = new Mobilization(parsed);
    return imported;
  }

}

let mobilization2017 = new Mobilization({
  schools: [
    { name: 'ШРИ', students: 40 },
    { name: 'ШРИ', students: 45 },
    { name: 'ШМР', students: 35 },
    { name: 'ШМД', students: 30 },
    { name: 'ШМ', students: -2 },
  ],
  lectures: [
    {
      name: 'Тестирование фронтенда своими руками',
      lecturer: 'Сергей Бережной',
      dateFrom: '2017-06-03 19:00',
      duration: 90,
      place: 'Синий Кит',
      schools: ['ШРИ']
    },
    {
      name: 'Дизайн-мышление в комнатных условиях',
      lecturer: 'Покрас Лампас',
      dateFrom: '2017-06-03 19:00',
      duration: 90,
      place: 'Мулен Руж',
      schools: ['ШМД']
    },
    {
      name: 'Особенности национальной платформы',
      lecturer: 'Евгений Кастрыкин',
      dateFrom: '2017-06-03 20:30',
      duration: 90,
      place: 'Мулен Руж',
      schools: ['ШМД', 'ШМР']
    },
    {
      name: 'Крутая лекция на все школы',
      lecturer: 'Аркадий Волож',
      dateFrom: '2017-06-08 19:00',
      duration: 90,
      place: 'Синий Кит',
      schools: ['ШРИ']
    },
    {
      name: 'Lorem ipsum',
      lecturer: 'Dolor Sit',
      dateFrom: '2017-06-11 19:00',
      duration: 90,
      place: 'Мой 2007',
      schools: ['ШМД', 'ШМР']
    },
    {
      name: 'Другая лекция',
      lecturer: 'Другой препод',
      dateFrom: '2017-06-11 21:30',
      duration: 90,
      place: 'Мой 2007',
      schools: ['ШМР']
    },
    {
      name: 'Как я стал рыбой',
      lecturer: 'Евгений Комаров',
      dateFrom: '2017-06-09 19:00',
      duration: 90,
      place: 'Сентябрь Горит',
      schools: ['ШМД']
    },
    {
      name: 'А я стал игуаной',
      lecturer: 'Артемий Лебедев',
      dateFrom: '2017-06-12 20:30',
      duration: 90,
      place: 'Сентябрь Горит',
      schools: ['ШМД']
    },
    {
      name: 'Я очень крутой кодер в Яндексе',
      lecturer: 'Левый Тип-какой-то',
      dateFrom: '2017-06-12 19:00',
      duration: 90,
      place: 'Песнь Льда',
      schools: ['ШРИ', 'ШМР']
    },
    {
      name: 'Очередное мероприятие для всех',
      lecturer: 'Сергей Бережной',
      dateFrom: '2017-06-15 19:00',
      duration: 90,
      place: 'Песнь Льда',
      schools: ['ШРИ', 'ШМД', 'ШМР']
    },
  ],
  places: [
    {
      name: 'Мулен Руж',
      capacity: 90
    },
    {
      name: 'Синий Кит',
      capacity: 160
    },
    {
      name: 'Мой 2007',
      capacity: 140
    },
    {
      name: 'Песнь Льда',
      capacity: 120
    },
    {
      name: 'И Пламени',
      capacity: 130
    },
    {
      name: 'Сентябрь Горит',
      capacity: 95
    },
  ]
});

let lecture = {
  name: 'Адаптивный дизайн и вёрстка',
  lecturer: 'Антон Пемп',
  dateFrom: '2017-06-06 19:00',
  duration: 90,
  place: 'Синий Кит',
  schools: ['ШРИ', 'ШМД']
};

let school = {
  name: 'Академия Гипербатона',
  students: 666
}


// console.log(mobilization2017.placeIsFree('Мулен Руж', '2017-06-03 19:00', 90));
