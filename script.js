document.addEventListener('DOMContentLoaded', function() {
    // Данные о тарифах
    const prices = {
        weekday: {
            regular: { '1': 690, '3': 1690, 'full': 2190 },
            discount: { '1': 450, '3': 1390, 'full': 1990 }
        },
        weekend: {
            regular: { '1': 990, '3': 1990, 'full': 2990 },
            discount: { '1': 550, '3': 1550, 'full': 2490 }
        }
    };

    // Элементы
    const childrenCountInput = document.getElementById('children-count');
    const tariffSelect = document.getElementById('tariff');
    const dayTypeSelect = document.getElementById('day-type');
    const multiChildCheckbox = document.getElementById('multi-child');
    const birthdayCheckbox = document.getElementById('birthday');
    const pascalCheckbox = document.getElementById('pascal');
    const calculateBtn = document.getElementById('calculate-btn');
    const totalPriceElement = document.getElementById('total-price');
    const calculationDetailsElement = document.getElementById('calculation-details');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const getCardBtn = document.getElementById('getCardBtn');
    const registerModal = document.getElementById('registerModal');
    const cardInfoModal = document.getElementById('cardInfoModal');
    const registerForm = document.getElementById('registerForm');
    const closeModals = document.querySelectorAll('.close-modal');
    const loyaltyCardBody = document.getElementById('cardBody');

    // Мобильное меню
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
    });

    // Закрытие модальных окон
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            registerModal.style.display = 'none';
            cardInfoModal.style.display = 'none';
        });
    });

    // Клик вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target === registerModal) registerModal.style.display = 'none';
        if (e.target === cardInfoModal) cardInfoModal.style.display = 'none';
    });

    // Карта лояльности
    class LoyaltyCard {
        constructor() {
            this.cardData = JSON.parse(localStorage.getItem('magicCastleCard')) || null;
            this.qrRefreshInterval = 4 * 60 * 60 * 1000; // 4 часа
            this.init();
        }

        init() {
            this.updateCardDisplay();
            getCardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.cardData) {
                    this.showCardInfo();
                } else {
                    this.showRegisterForm();
                }
            });
        }

        showRegisterForm() {
            registerModal.style.display = 'block';
        }

        showCardInfo() {
            this.generateQR();
            document.getElementById('cardPhone').textContent = this.cardData.phone;
            document.getElementById('cardChildren').textContent = this.cardData.children;
            document.getElementById('cardPoints').textContent = this.cardData.points || 500;
            cardInfoModal.style.display = 'block';
        }

        registerCard(phone, children) {
            this.cardData = {
                phone,
                children,
                points: 500,
                registered: new Date().toISOString(),
                lastQRUpdate: Date.now()
            };
            localStorage.setItem('magicCastleCard', JSON.stringify(this.cardData));
            registerModal.style.display = 'none';
            this.updateCardDisplay();
            this.showCardInfo();
            
            // Автоматически ставим галочку "многодетная семья" если детей > 2
            if (children > 2) {
                multiChildCheckbox.checked = true;
                calculatePrice();
            }
        }

        updateCardDisplay() {
            if (!loyaltyCardBody) return;
            
            if (this.cardData) {
                loyaltyCardBody.innerHTML = `
                    <div class="card-body-content">
                        <div class="card-qr" id="liveQR"></div>
                        <div class="card-details">
                            <h4>Ваша карта активирована</h4>
                            <p>Телефон: ${this.cardData.phone}</p>
                            <p>Детей: ${this.cardData.children}</p>
                            <p class="bonus-points">${this.cardData.points} баллов</p>
                            <button class="btn btn-primary" id="viewCardBtn">Показать карту</button>
                        </div>
                    </div>
                `;
                
                document.getElementById('viewCardBtn').addEventListener('click', () => {
                    this.showCardInfo();
                });
                
                this.generateLiveQR();
            } else {
                loyaltyCardBody.innerHTML = `
                    <div class="card-body-content">
                        <h4>Получите Волшебный ключ</h4>
                        <p>Зарегистрируйтесь и получите:</p>
                        <ul style="text-align: left; margin: 20px 0;">
                            <li>500 приветственных баллов</li>
                            <li>Скидку 15% каждую среду</li>
                            <li>Автоматический расчет скидок</li>
                            <li>Бонусы на день рождения</li>
                        </ul>
                        <button class="btn btn-primary" id="registerCardBtn">Зарегистрировать карту</button>
                    </div>
                `;
                
                document.getElementById('registerCardBtn').addEventListener('click', () => {
                    this.showRegisterForm();
                });
            }
        }

        generateQR() {
            const qrContainer = document.getElementById('qrContainer');
            if (!qrContainer) return;
            
            qrContainer.innerHTML = '';
            
            const now = Date.now();
            const qrData = JSON.stringify({
                phone: this.cardData.phone,
                timestamp: now,
                expires: now + this.qrRefreshInterval
            });
            
            QRCode.toCanvas(qrContainer, qrData, {
                width: 180,
                margin: 1,
                color: {
                    dark: '#5e35b1',
                    light: '#ffffff'
                }
            });
        }

        generateLiveQR() {
            const liveQR = document.getElementById('liveQR');
            if (!liveQR) return;
            
            const now = Date.now();
            const qrData = JSON.stringify({
                phone: this.cardData.phone,
                timestamp: now,
                expires: now + this.qrRefreshInterval
            });
            
            QRCode.toCanvas(liveQR, qrData, {
                width: 140,
                margin: 1,
                color: {
                    dark: '#ffffff',
                    light: 'transparent'
                }
            });
        }

        addPoints(amount) {
            if (!this.cardData) return;
            this.cardData.points = (this.cardData.points || 0) + amount;
            localStorage.setItem('magicCastleCard', JSON.stringify(this.cardData));
            this.updateCardDisplay();
        }
    }

    // Инициализация карты
    const loyaltyCard = new LoyaltyCard();

    // Форма регистрации
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phone = document.getElementById('regPhone').value;
        const children = parseInt(document.getElementById('regChildren').value) || 1;
        
        if (phone && phone.length >= 10) {
            loyaltyCard.registerCard(phone, children);
        }
    });

    // Расчет стоимости
    function calculatePrice() {
        const childrenCount = parseInt(childrenCountInput.value) || 1;
        const tariff = tariffSelect.value;
        const dayType = dayTypeSelect.value;
        const isMultiChild = multiChildCheckbox.checked;
        const isBirthday = birthdayCheckbox.checked;
        const isPascal = pascalCheckbox.checked;
        
        let basePricePerChild;
        
        if (isMultiChild) {
            basePricePerChild = prices[dayType].discount[tariff];
        } else {
            basePricePerChild = prices[dayType].regular[tariff];
        }
        
        let totalPrice = basePricePerChild * childrenCount;
        let details = [];
        
        let tariffName;
        switch(tariff) {
            case '1': tariffName = '1 час'; break;
            case '3': tariffName = '3 часа'; break;
            case 'full': tariffName = 'Безлимит на весь день'; break;
        }
        
        details.push(`${childrenCount} ребёнок(а) × ${tariffName}: ${basePricePerChild.toLocaleString('ru-RU')} руб.`);
        
        if (isBirthday) {
            const birthdayDiscount = totalPrice * 0.3;
            details.push(`Скидка на день рождения 30%: -${birthdayDiscount.toLocaleString('ru-RU')} руб.`);
            totalPrice -= birthdayDiscount;
        }
        
        if (isPascal) {
            const pascalDiscount = totalPrice * 0.15;
            details.push(`Скидка "Паскальная среда" 15%: -${pascalDiscount.toLocaleString('ru-RU')} руб.`);
            totalPrice -= pascalDiscount;
        }
        
        totalPrice = Math.round(totalPrice);
        
        totalPriceElement.textContent = `${totalPrice.toLocaleString('ru-RU')} руб.`;
        
        if (details.length > 1) {
            calculationDetailsElement.innerHTML = details.join('<br>');
        } else {
            calculationDetailsElement.textContent = '';
        }
        
        // Начисление баллов (10% от суммы)
        if (loyaltyCard.cardData) {
            const pointsToAdd = Math.round(totalPrice * 0.1);
            loyaltyCard.addPoints(pointsToAdd);
        }
    }
    
    // Обработчики для калькулятора
    calculateBtn.addEventListener('click', calculatePrice);
    childrenCountInput.addEventListener('input', calculatePrice);
    tariffSelect.addEventListener('change', calculatePrice);
    dayTypeSelect.addEventListener('change', calculatePrice);
    multiChildCheckbox.addEventListener('change', calculatePrice);
    birthdayCheckbox.addEventListener('change', calculatePrice);
    pascalCheckbox.addEventListener('change', calculatePrice);
    
    // Автоматически ставим галочку "многодетная семья" если в карте указано >2 детей
    if (loyaltyCard.cardData && loyaltyCard.cardData.children > 2) {
        multiChildCheckbox.checked = true;
    }
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                if (window.innerWidth <= 767) {
                    nav.classList.remove('active');
                }
            }
        });
    });
    
    // Динамическое обновление CTA
    function updateCTABasedOnTime() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        
        if (dayOfWeek === 3) { // Среда
            document.querySelector('.hero-title').textContent = 'Сегодня Паскальная Среда!';
            pascalCheckbox.checked = true;
            calculatePrice();
        }
    }
    
    updateCTABasedOnTime();
    calculatePrice();
    
    // Автоматическое обновление QR-кода каждые 4 часа
    setInterval(() => {
        if (loyaltyCard.cardData) {
            loyaltyCard.updateCardDisplay();
        }
    }, loyaltyCard.qrRefreshInterval);
    
    // Обновляем дату в футере
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const footerDateElement = document.querySelector('.footer-bottom p:first-child');
    if (footerDateElement) {
        footerDateElement.innerHTML = `© 2026 «Волшебный замок». Все права защищены. Техническое задание версия 3.0 (актуальна на ${formattedDate})`;
    }
});