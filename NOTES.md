# HAUZ Take-home — Notes

## Qigan asosiy ishlarim

Authentication va profile bilan bog'liq ma'lumotlarni server tomonda ishlatishga harakat qildim. Browser tarafida Appwrite session secret yoki API key ishlatilmaydi. Frontend server functionlar orqali ishlaydi, Personal Account ma’lumotlari esa faqat Appwrite Function orqali olinadi va o‘zgartiriladi.

Profile egasini aniqlashda request ichidan keladigan `userId` ga ishonmadim. Buning o'rniga Appwrite tomonidan beriladigan `x-appwrite-user-id` ishlatiladi. Shu orqali bir foydalanuvchi boshqa foydalanuvchining profile ma’lumotlariga kira olmaydi yoki ularni o'zgartira olmaydi.

Account yaratilgandan keyin `role` ni o‘zgartirishga ruxsat berilmaydi. `contactEmail` va `bio` esa ixtiyoriy. Agar kerak bo‘lsa, `null` yuborib ularni tozalash mumkin.

Login paytida `redirect` query parametrini ham hisobga oldim. Agar foydalanuvchi hali Personal Account yaratmagan bo‘lsa, onboarding sahifasiga o‘tadi. Account mavjud bo‘lsa, kerakli sahifaga qaytariladi.

Header uchun current user server tomonda tekshiriladi. Shu sababli sahifani qayta yuklaganda ham foydalanuvchining login holati to‘g‘ri chiqadi.

Onboardingda Continue tugmasini ketma-ket bosib yuborishning oldini oldim. Bundan tashqari, backend tarafida ham `appwrite_user_id` unique bo‘lgani uchun bir foydalanuvchiga ikkita Personal Account yaratilmaydi.

## Topshiriqdagi ayrim qarorlar

Profile ma’lumotlarini frontenddan to‘g‘ridan-to‘g‘ri Appwrite database'ga yubormadim. Bu qismni Appwrite Function orqali qildim, chunki topshiriqda ham shu talab qilingan.

Agar authentication paytida xatolik chiqsa, foydalanuvchini signed out deb hisoblayman. Masalan, session eskirgan yoki ishlamay qolgan bo‘lsa, session cookie o‘chiriladi va foydalanuvchi login sahifasiga qaytadi.

## Agent xatolari

1. Dastlab Personal Account request'i Appwrite'da authenticated user'ni to‘g‘ri uzatmagan va `401 No authenticated principal` xatosi chiqqan. Keyin request'ni session orqali yuboradigan qilib tuzatdim. Bu `e734541` commit'da tuzatilgan.

2. Dastlab Appwrite Node SDK'da mavjud bo‘lmagan `createJWT` kabi API ishlatilgan. O‘rnatilgan SDK versiyasini tekshirib, mavjud API'lar orqali ishlaydigan variantga o‘zgartirdim. Yakuniy tuzatish `e734541` commit'da.

3. Login'dan keyingi flow'da Personal Account mavjud yoki mavjud emasligini to‘g‘ri ajratish bilan muammo bo‘lgan. Natijada yangi foydalanuvchi onboarding o‘rniga `Profile not found` holatiga tushib qolgan. Keyin login va profile flow'larini qayta tekshirib, `e734541` commit'da tuzatdim.

## Production uchun keyingi ishlar

Agar loyiha production'ga chiqadigan bo‘lsa, birinchi navbatda authentication, onboarding, profile authorization, redirect va duplicate account holatlari uchun avtomatik testlar qo‘shgan bo‘lardim.

Email orqali login qilish qismiga rate limiting qo‘shish ham kerak. Bundan tashqari, Appwrite Function uchun error handling va logging'ni yaxshilash, kerakli joylarda request validation'ni kuchaytirish va asosiy user flow'lar uchun end-to-end testlar yozish mumkin.

Shundan keyin UI, accessibility va umumiy UX'ni yaxshilashga vaqt ajratgan bo‘lardim. Lekin xozir project asosan funksional qismiga etibor berdim.
