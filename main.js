'use strict'

const moment = require('moment');
require('moment/locale/ru');

moment.locale('ru');

console.log(moment('2016-06-03 19:00').format('Do MMM YYYY hh:mm'));

class Mobilization {

  constructor(setup) {

    // Инициализируем основные массивы для сущностей
    this.schools = [];
    this.lectures = [];
    this.places = [];

    if(setup) {
      if (setup.schools) { // Проверяем школы
        setup.schools.forEach((school) => {
          this.addSchool(school);
        })
      }
      if (setup.places) {
        setup.places.forEach((place) => {
          this.addPlace(place);
        });
      }
    }

  }

  /* Методы, относящиеся к лекциям */

  addLecture(lecture) {
    if(this.checkLecture(lecture)) {
      // TODO: date replace, if it's string,
    }
  }

  getLecture(name) {
    return this.lectures.find((lecture) => {
      if(lecture.name === name) {
        return lecture;
      }
      return false;
    }) || false;
  }

  checkLecture(lecture) {
    if (
      (typeof lecture.name === 'string' || lecture.name instanceof String) &&
      (typeof lecture.lecturer === 'string' || lecture.name instanceof String) &&
      (typeof lecture.duration === 'number' || lecture.duration instanceof Number) &&
      this.getPlace(lecture.place) &&
      lecture.schools.length &&
      lecture.schools.every((school) => { return this.getSchool(school) }) &&
      this.placeIsCapable(lecture.place, lecture.schools) &&
      moment(lecture.dateFrom).isValid()
      // TODO: placeIsFree check.
    ){ // Если вся инфа о школах заполнена как надо,
      if (!this.getLecture(lecture.name)) { // и такой школы не существует
        return true;
      }
    }
    return false;
  }

  /* Методы, относящиеся к школам */

  addSchool(school) {
    if(this.checkSchool(school)) {
      this.schools.push(school); // Кладём школу в массив школ
      console.info('Школа "' + school.name + '" успешно добавлена');
      return true;
    }
    else {
      console.error('Ошибка: школа "' + school.name + '" не добавлена, проверьте данные')
      return false;
    }
  }

  getSchool(name) {
      return this.schools.find((school) => {
        if (school.name === name) {
          return school;
        }
        return false;
      }) || false;
  }

  checkSchool(school) {
    if (typeof school.name === 'string' && typeof school.students === 'number'
        && school.students >= 1) { // Если вся инфа о школах заполнена как надо,
      if (!this.getSchool(school.name)) { // и такой школы не существует
        return true;
      }
    }
    return false;
  }

  /* Аудитории */

  addPlace(place) {
    if(this.checkPlace(place)) {
      this.places.push(place); // Кладём школу в массив школ
      console.info('Аудитория "' + place.name + '" успешно добавлена');
      return true;
    }
    else {
      console.error('Ошибка: аудитория "' + place.name + '" не добавлена, проверьте данные')
      return false;
    }
  }

  getPlace(name) {
    return this.places.find((place) => {
        if (place.name === name) {
          return place;
        }
        return false;
      }) || false;
  }

  checkPlace(place) {
    if (typeof place.name === 'string' && typeof place.capacity === 'number'
        && place.capacity >= 1) { // Если вся инфа о школах заполнена как надо,
      if (!this.getPlace(place.name)) { // и такой школы не существует
        return true;
      }
    }
    return false;
  }

  placeIsCapable(place, schools) {
    // проверяем, не попала ли случайно в первый параметр строка с названием аудитории
    if (typeof place === 'string' || place instanceof String) {
      place = this.getPlace(place);
    }

    schools = schools.map((school) => {
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

    if (place.capacity >= schools.reduce((prev, current, a, b, c) => {
      return { students: prev.students + current.students }
    }).students) {
      return true;
    }
    return false;
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
      dateFrom: '3 июля 2017 19:00',
      duration: 90,
      place: 'Синий Кит',
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
      capacity: 0
    }
  ]
});

// console.log(mobilization2017.placeIsCapable(mobilization2017.getPlace('Синий Кит'), [mobilization2017.getSchool('ШРИ'), mobilization2017.getSchool('ШМД')]));
// console.log(mobilization2017.placeIsCapable('Синий Кит', [mobilization2017.getSchool('ШРИ'), mobilization2017.getSchool('ШМД')]));
// console.log(mobilization2017.placeIsCapable('Синий Кит', ['ШРИ', 'ШМР', 'ШМД']));

let lecture = {
  name: 'Тестирование фронтенда своими руками',
  lecturer: 'Сергей Бережной',
  dateFrom: '2017-06-03 19:00',
  duration: 90,
  place: 'Синий Кит',
  schools: ['ШРИ']
};

console.log(mobilization2017.checkLecture(lecture));
