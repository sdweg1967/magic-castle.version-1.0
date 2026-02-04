// Калькулятор стоимости посещения
document.addEventListener('DOMContentLoaded', function() {
    // Данные о тарифах
    const prices = {
        weekday: {
            regular: {
                '1': 690,
                '3': 1690,
                'full': 2190
            },
            discount: {
                '1': 450,
                '3': 1390,
                'full': 1990
            }
        },
        weekend: {
            regular: {
                '1': 990,
                '3': 1990,
                'full': 2990
            },
            discount: {
                '1': 550,
                '3': 1550,
                'full': 2490
            }
        }
    };
    
    // Элементы калькулятора
    const childrenCountInput = document.getElementById('children-count');
    const tariffSelect = document.getElementById('tariff');
    const dayTypeSelect = document.getElementById('day-type');
    const multiChildCheckbox = document.getElementById('multi-child');
    const birthdayCheckbox = document.getElementById('birthday');
    const pascalCheckbox = document.getElementById('pascal');
    const calculateBtn = document.getElementById('calculate-btn');
    const totalPriceElement = document.getElementById('total-price');
    const calculationDetailsElement = document.getElementById('calculation-details');
    
    // Функция расчета стоимости
    function calculatePrice() {
        const childrenCount = parseInt(childrenCountInput.value) || 1;
        const tariff = tariffSelect.value;
        const dayType = dayTypeSelect.value;
        const isMultiChild = multiChildCheckbox.checked;
        const isBirthday = birthdayCheckbox.checked;
        const isPascal = pascalCheckbox.checked;
        
        // Получаем базовую цену за одного ребенка
        let basePricePerChild;
        
        if (isMultiChild) {
            basePricePerChild = prices[dayType].discount[tariff];
        } else {
            basePricePerChild = prices[dayType].regular[tariff];
        }
        
        // Расчет общей стоимости
        let totalPrice = basePricePerChild * childrenCount;
        let details = [];
        
        // Форматирование названия тарифа
        let tariffName;
        switch(tariff) {
            case '1': tariffName = '1 час'; break;
            case '3': tariffName = '3 часа'; break;
            case 'full': tariffName = 'Безлимит на весь день'; break;
        }
        
        details.push(`${childrenCount} ребёнок(а) × ${tariffName}: ${basePricePerChild.toLocaleString('ru-RU')} руб. × ${childrenCount} = ${(basePricePerChild * childrenCount).toLocaleString('ru-RU')} руб.`);
        
        // Применение скидки на день рождения (30%)
        if (isBirthday) {
            const birthdayDiscount = totalPrice * 0.3;
            details.push(`Скидка на день рождения 30%: -${birthdayDiscount.toLocaleString('ru-RU')} руб.`);
            totalPrice -= birthdayDiscount;
        }
        
        // Применение скидки Паскальной среды (15%)
        if (isPascal) {
            const pascalDiscount = totalPrice * 0.15;
            details.push(`Скидка "Паскальная среда" 15%: -${pascalDiscount.toLocaleString('ru-RU')} руб.`);
            totalPrice -= pascalDiscount;
        }
        
        // Округление до целых рублей
        totalPrice = Math.round(totalPrice);
        
        // Обновление UI
        totalPriceElement.textContent = `${totalPrice.toLocaleString('ru-RU')} руб.`;
        
        if (details.length > 1) {
            calculationDetailsElement.innerHTML = details.join('<br>');
        } else {
            calculationDetailsElement.textContent = '';
        }
        
        // Подсветка итоговой цены в зависимости от величины
        if (totalPrice > 5000) {
            totalPriceElement.style.color = '#d81b60';
        } else if (totalPrice > 3000) {
            totalPriceElement.style.color = '#ff4081';
        } else {
            totalPriceElement.style.color = '#5e35b1';
        }
    }
    
    // Обработчики событий
    calculateBtn.addEventListener('click', calculatePrice);
    
    childrenCountInput.addEventListener('change', calculatePrice);
    tariffSelect.addEventListener('change', calculatePrice);
    dayTypeSelect.addEventListener('change', calculatePrice);
    multiChildCheckbox.addEventListener('change', calculatePrice);
    birthdayCheckbox.addEventListener('change', calculatePrice);
    pascalCheckbox.addEventListener('change', calculatePrice);
    
    // Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
        
        if (nav.style.display === 'flex') {
            nav.style.flexDirection = 'column';
            nav.style.position = 'absolute';
            nav.style.top = '100%';
            nav.style.left = '0';
            nav.style.right = '0';
            nav.style.backgroundColor = 'white';
            nav.style.padding = '20px';
            nav.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            nav.style.zIndex = '1000';
            nav.style.gap = '15px';
        }
    });
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Закрытие мобильного меню
                if (window.innerWidth <= 768) {
                    nav.style.display = 'none';
                }
            }
        });
    });
    
    // Динамическое обновление CTA в зависимости от дня недели
    function updateCTABasedOnTime() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 - воскресенье, 1 - понедельник и т.д.
        const hour = now.getHours();
        
        // Находим все CTA кнопки на главной
        const ctaButtons = document.querySelectorAll('.btn-primary');
        const heroSection = document.querySelector('.hero');
        
        // Если среда (3) - акцент на Паскальную среду
        if (dayOfWeek === 3) {
            document.querySelector('.hero-title').textContent = 'Сегодня Паскальная Среда!';
            document.querySelector('.hero-subtitle').innerHTML = 'Скидка <strong>15%</strong> на посещение и кафе для держателей карты «Волшебный ключ». Не упустите возможность!';
            
            // Подсветка акции "Паскальная среда"
            const pascalEvent = document.querySelector('.event-card.pascal');
            if (pascalEvent) {
                pascalEvent.style.boxShadow = '0 0 0 3px #ff4081, 0 8px 24px rgba(0, 0, 0, 0.15)';
                pascalEvent.style.transform = 'translateY(-5px)';
            }
        }
        
        // Если вечер (после 18:00) - акцент на вечернее посещение
        if (hour >= 18) {
            if (heroSection) {
                heroSection.style.background = 'linear-gradient(rgba(26, 26, 46, 0.9), rgba(94, 53, 177, 0.8)), url("https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")';
                heroSection.style.backgroundSize = 'cover';
                heroSection.style.backgroundPosition = 'center';
                
                document.querySelector('.hero-date').innerHTML = 'Вечернее время — идеально для семейного отдыха после работы!';
            }
        }
    }
    
    // Вызываем функцию обновления CTA
    updateCTABasedOnTime();
    
    // Имитация расчета стоимости при загрузке
    calculatePrice();
    
    // Добавляем эффект появления элементов при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Наблюдаем за секциями
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
    
    // Имитация регистрации карты лояльности
    const registerCardBtn = document.querySelector('.card-actions .btn-primary');
    if (registerCardBtn) {
        registerCardBtn.addEventListener('click', function() {
            const phone = prompt('Для регистрации виртуальной карты «Волшебный ключ» введите ваш номер телефона:');
            if (phone && phone.length >= 10) {
                alert(`Карта успешно зарегистрирована на номер ${phone}!\nQR-код и данные карты будут отправлены вам в SMS.\n500 приветственных баллов уже на вашем счету!`);
                registerCardBtn.textContent = 'Карта активирована';
                registerCardBtn.style.backgroundColor = '#4CAF50';
                registerCardBtn.disabled = true;
            } else if (phone !== null) {
                alert('Пожалуйста, введите корректный номер телефона.');
            }
        });
    }
    
    // Текущая дата для футера
    const currentDate = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('ru-RU', options);
    
    // Обновляем дату в футере
    const footerDateElement = document.querySelector('.footer-bottom p:first-child');
    if (footerDateElement) {
        footerDateElement.innerHTML = `© 2026 «Волшебный замок». Все права защищены. Техническое задание версия 3.0 (актуальна на ${formattedDate})`;
    }
});
