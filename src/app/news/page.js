'use client'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const news = [
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: '/news.png',
    time: '8 hours ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: 'https://s3-alpha-sig.figma.com/img/18da/24d1/f176376b9bb4073e276aa5cf1e93628f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=h5V1e8vDGULWVHPPDZY8gwsUgxFil8fGqRSix1bVmENOvTnc-QXjNsxUdDJlfd3Q3zq-FHkIaOJDr5xl2UaxwBSsxObTLtjpJfslZIUGQXvOr2dVlOSwJ3H-d9WdhjJ2qlgC42x~RgUggW--9rAO2yckoi~A39bTBcK4gnEeC2A4YrJJeG8FXhMTMiul5O2OeFK-a7ErxMgGBc3GMBXnIQ~~StTO9vLUh2bLeMB~xN5EMsb1lKsZrqDe0mCkd4Hmksuxa5Em3jihgzkSXkr31tR~KlzhOxluRnuR5fyQ0P8piNh-ucwsIzHR~~cNnl4pHMU8oLAVTmZMpGFzPF6dQQ__',
    time: '8 hours ago',
  },
  {
    title:
      'Get Tickets and Pay Per View for IKF Spring Classic Super Fights! Myrtle Beach, SC',
    description:
      'Get the Best Prices on Tickets for the best show in the Grand Strand this Saturday, March 15th! Fights will be at...',
    img: 'https://s3-alpha-sig.figma.com/img/1b66/67cf/809244bc93484e0e2880ede325be2a8d?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aOMyPdjguFIMxX-AM7EUpsQ9Wk0RguAkFqasHU4FoVPNJ9U31stTTOdGmXdVsnccx5-WtnxmuVq--oSoAZZUEDsc8a76JYhcJpiH4PEVoPd7v9Chl~YeCdF~K8D2ibFy-ZpDz-v0k~C18MsN5bApF5FMtTuPMavq-WJXlL7hix-9rjMbhVOO3UmKQvdK~I7YwDI9FQZ3~NFCw--p9Fq5kaCK6vpmVPYTMU482AYgrpSKJ9ul45DZuBjEsRxrTE3hFUa87GHFcwF7HhmI7VIHdkxeZ2xxt1OhbEQQkktKspp6koVAf~7zkj4-QnYjwl4-Y4S--FwEES~Ze11b1bPKPQ__',
    time: '1 day ago',
  },
  {
    title:
      'Great Semi Contact also at the IKF Spring Classic! Tickets on Sale Now!',
    description:
      'PSR Point Kickboxing & Muay Thai Sparring will be part of the IKF Spr...',
    img: 'https://s3-alpha-sig.figma.com/img/28ca/dbe4/dcf28a3b76bdea8db3030c422b77e63a?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=uHuqqKlvVDzHcTgvYhsCei~-ddzn4za3EdWlNoUysFi00emSTaXPyrLy-wmm9OEGXbfWhU7AXCsOXltRGa9yLVyB9loTq~ZdhsXBUvHsJ9VB1IOYzmuR-7fUdvS7b008QeDzl6Vuk-n6nl~GB6UBN~-oJIh0kPuJRv5cFfUy67s7wakpfuGzX4pDiu4S0gsdM9glC4WACBVvzDyj~8L15aSgWsBEXi5-2MyUhSeXtwGpmtW-ikUK5AKSaV-g4G2g~3GTHcoJA3Yb-H9IngsV4FEp57MKc1pU1ZinCR6SQGq2595Mof4Fq1uHQhB0AUc86WD2AniDgPMJwFya1XMAOw__',
    time: '2 days ago',
  },
  {
    title:
      "Introducing 'Shooter Gloves': Perfect for MMA and IKF Freestyle Kickboxing",
    description:
      "Introducing 'Shooter Gloves': Perfect for MMA and IKF Freestyle Kickboxing by Blackout Gear Company...",
    img: 'https://s3-alpha-sig.figma.com/img/1b66/67cf/809244bc93484e0e2880ede325be2a8d?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aOMyPdjguFIMxX-AM7EUpsQ9Wk0RguAkFqasHU4FoVPNJ9U31stTTOdGmXdVsnccx5-WtnxmuVq--oSoAZZUEDsc8a76JYhcJpiH4PEVoPd7v9Chl~YeCdF~K8D2ibFy-ZpDz-v0k~C18MsN5bApF5FMtTuPMavq-WJXlL7hix-9rjMbhVOO3UmKQvdK~I7YwDI9FQZ3~NFCw--p9Fq5kaCK6vpmVPYTMU482AYgrpSKJ9ul45DZuBjEsRxrTE3hFUa87GHFcwF7HhmI7VIHdkxeZ2xxt1OhbEQQkktKspp6koVAf~7zkj4-QnYjwl4-Y4S--FwEES~Ze11b1bPKPQ__',
    time: '3 days ago',
  },
  {
    title:
      'Get Tickets and Pay Per View for IKF Spring Classic Super Fights! Myrtle Beach, SC',
    description:
      'Get the Best Prices on Tickets for the best show in the Grand Strand this Saturday, March 15th! Fights will be at...',
    img: 'https://s3-alpha-sig.figma.com/img/01d8/826f/5c52a35ac978105397cdbf2534a77596?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=R5ZI1VBGxEJPURHgbmZcBlcN27ANNhvkFgtI9gaVThXZziwtLsOKTlWQCnR6oTBQHh50XLo4nR05sKazGe2Pa~KUxiC76yWzrPVbwiLQodQnHvlRFlhM97K5h1IQ3dM4HT9oHYfUrScyJ0cFCbQ4m7tDMhLvXkZfDplW6~iDED0KQJ7xYWlwIqbOmQM-olXd-Z82-ok6OCRH9JbY~QMk2BXvY~Rv0GKn97e1nq9C7fDqeFnWxv5wI1V-8fYQe~KlzF8RLRnZAGlZmJPB8BXTuyoirhUqW28KN8QL1dh7CMQlv6RnUV~5qF3iILzpNWBlRvzuLHqNAe4ZjoCZRVJNUw__',
    time: '5 days ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: '/news.png',
    time: '8 hours ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: 'https://s3-alpha-sig.figma.com/img/18da/24d1/f176376b9bb4073e276aa5cf1e93628f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=h5V1e8vDGULWVHPPDZY8gwsUgxFil8fGqRSix1bVmENOvTnc-QXjNsxUdDJlfd3Q3zq-FHkIaOJDr5xl2UaxwBSsxObTLtjpJfslZIUGQXvOr2dVlOSwJ3H-d9WdhjJ2qlgC42x~RgUggW--9rAO2yckoi~A39bTBcK4gnEeC2A4YrJJeG8FXhMTMiul5O2OeFK-a7ErxMgGBc3GMBXnIQ~~StTO9vLUh2bLeMB~xN5EMsb1lKsZrqDe0mCkd4Hmksuxa5Em3jihgzkSXkr31tR~KlzhOxluRnuR5fyQ0P8piNh-ucwsIzHR~~cNnl4pHMU8oLAVTmZMpGFzPF6dQQ__',
    time: '8 hours ago',
  },
  {
    title:
      'Get Tickets and Pay Per View for IKF Spring Classic Super Fights! Myrtle Beach, SC',
    description:
      'Get the Best Prices on Tickets for the best show in the Grand Strand this Saturday, March 15th! Fights will be at...',
    img: 'https://s3-alpha-sig.figma.com/img/1b66/67cf/809244bc93484e0e2880ede325be2a8d?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aOMyPdjguFIMxX-AM7EUpsQ9Wk0RguAkFqasHU4FoVPNJ9U31stTTOdGmXdVsnccx5-WtnxmuVq--oSoAZZUEDsc8a76JYhcJpiH4PEVoPd7v9Chl~YeCdF~K8D2ibFy-ZpDz-v0k~C18MsN5bApF5FMtTuPMavq-WJXlL7hix-9rjMbhVOO3UmKQvdK~I7YwDI9FQZ3~NFCw--p9Fq5kaCK6vpmVPYTMU482AYgrpSKJ9ul45DZuBjEsRxrTE3hFUa87GHFcwF7HhmI7VIHdkxeZ2xxt1OhbEQQkktKspp6koVAf~7zkj4-QnYjwl4-Y4S--FwEES~Ze11b1bPKPQ__',
    time: '1 day ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: '/news.png',
    time: '8 hours ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: 'https://s3-alpha-sig.figma.com/img/18da/24d1/f176376b9bb4073e276aa5cf1e93628f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=h5V1e8vDGULWVHPPDZY8gwsUgxFil8fGqRSix1bVmENOvTnc-QXjNsxUdDJlfd3Q3zq-FHkIaOJDr5xl2UaxwBSsxObTLtjpJfslZIUGQXvOr2dVlOSwJ3H-d9WdhjJ2qlgC42x~RgUggW--9rAO2yckoi~A39bTBcK4gnEeC2A4YrJJeG8FXhMTMiul5O2OeFK-a7ErxMgGBc3GMBXnIQ~~StTO9vLUh2bLeMB~xN5EMsb1lKsZrqDe0mCkd4Hmksuxa5Em3jihgzkSXkr31tR~KlzhOxluRnuR5fyQ0P8piNh-ucwsIzHR~~cNnl4pHMU8oLAVTmZMpGFzPF6dQQ__',
    time: '8 hours ago',
  },
  {
    title:
      'Get Tickets and Pay Per View for IKF Spring Classic Super Fights! Myrtle Beach, SC',
    description:
      'Get the Best Prices on Tickets for the best show in the Grand Strand this Saturday, March 15th! Fights will be at...',
    img: 'https://s3-alpha-sig.figma.com/img/1b66/67cf/809244bc93484e0e2880ede325be2a8d?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aOMyPdjguFIMxX-AM7EUpsQ9Wk0RguAkFqasHU4FoVPNJ9U31stTTOdGmXdVsnccx5-WtnxmuVq--oSoAZZUEDsc8a76JYhcJpiH4PEVoPd7v9Chl~YeCdF~K8D2ibFy-ZpDz-v0k~C18MsN5bApF5FMtTuPMavq-WJXlL7hix-9rjMbhVOO3UmKQvdK~I7YwDI9FQZ3~NFCw--p9Fq5kaCK6vpmVPYTMU482AYgrpSKJ9ul45DZuBjEsRxrTE3hFUa87GHFcwF7HhmI7VIHdkxeZ2xxt1OhbEQQkktKspp6koVAf~7zkj4-QnYjwl4-Y4S--FwEES~Ze11b1bPKPQ__',
    time: '1 day ago',
  },
  {
    title:
      'Great Semi Contact also at the IKF Spring Classic! Tickets on Sale Now!',
    description:
      'PSR Point Kickboxing & Muay Thai Sparring will be part of the IKF Spr...',
    img: 'https://s3-alpha-sig.figma.com/img/28ca/dbe4/dcf28a3b76bdea8db3030c422b77e63a?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=uHuqqKlvVDzHcTgvYhsCei~-ddzn4za3EdWlNoUysFi00emSTaXPyrLy-wmm9OEGXbfWhU7AXCsOXltRGa9yLVyB9loTq~ZdhsXBUvHsJ9VB1IOYzmuR-7fUdvS7b008QeDzl6Vuk-n6nl~GB6UBN~-oJIh0kPuJRv5cFfUy67s7wakpfuGzX4pDiu4S0gsdM9glC4WACBVvzDyj~8L15aSgWsBEXi5-2MyUhSeXtwGpmtW-ikUK5AKSaV-g4G2g~3GTHcoJA3Yb-H9IngsV4FEp57MKc1pU1ZinCR6SQGq2595Mof4Fq1uHQhB0AUc86WD2AniDgPMJwFya1XMAOw__',
    time: '2 days ago',
  },
  {
    title:
      "Introducing 'Shooter Gloves': Perfect for MMA and IKF Freestyle Kickboxing",
    description:
      "Introducing 'Shooter Gloves': Perfect for MMA and IKF Freestyle Kickboxing by Blackout Gear Company...",
    img: 'https://s3-alpha-sig.figma.com/img/1b66/67cf/809244bc93484e0e2880ede325be2a8d?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aOMyPdjguFIMxX-AM7EUpsQ9Wk0RguAkFqasHU4FoVPNJ9U31stTTOdGmXdVsnccx5-WtnxmuVq--oSoAZZUEDsc8a76JYhcJpiH4PEVoPd7v9Chl~YeCdF~K8D2ibFy-ZpDz-v0k~C18MsN5bApF5FMtTuPMavq-WJXlL7hix-9rjMbhVOO3UmKQvdK~I7YwDI9FQZ3~NFCw--p9Fq5kaCK6vpmVPYTMU482AYgrpSKJ9ul45DZuBjEsRxrTE3hFUa87GHFcwF7HhmI7VIHdkxeZ2xxt1OhbEQQkktKspp6koVAf~7zkj4-QnYjwl4-Y4S--FwEES~Ze11b1bPKPQ__',
    time: '3 days ago',
  },
  {
    title:
      'Get Tickets and Pay Per View for IKF Spring Classic Super Fights! Myrtle Beach, SC',
    description:
      'Get the Best Prices on Tickets for the best show in the Grand Strand this Saturday, March 15th! Fights will be at...',
    img: 'https://s3-alpha-sig.figma.com/img/01d8/826f/5c52a35ac978105397cdbf2534a77596?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=R5ZI1VBGxEJPURHgbmZcBlcN27ANNhvkFgtI9gaVThXZziwtLsOKTlWQCnR6oTBQHh50XLo4nR05sKazGe2Pa~KUxiC76yWzrPVbwiLQodQnHvlRFlhM97K5h1IQ3dM4HT9oHYfUrScyJ0cFCbQ4m7tDMhLvXkZfDplW6~iDED0KQJ7xYWlwIqbOmQM-olXd-Z82-ok6OCRH9JbY~QMk2BXvY~Rv0GKn97e1nq9C7fDqeFnWxv5wI1V-8fYQe~KlzF8RLRnZAGlZmJPB8BXTuyoirhUqW28KN8QL1dh7CMQlv6RnUV~5qF3iILzpNWBlRvzuLHqNAe4ZjoCZRVJNUw__',
    time: '5 days ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: '/news.png',
    time: '8 hours ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: 'https://s3-alpha-sig.figma.com/img/18da/24d1/f176376b9bb4073e276aa5cf1e93628f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=h5V1e8vDGULWVHPPDZY8gwsUgxFil8fGqRSix1bVmENOvTnc-QXjNsxUdDJlfd3Q3zq-FHkIaOJDr5xl2UaxwBSsxObTLtjpJfslZIUGQXvOr2dVlOSwJ3H-d9WdhjJ2qlgC42x~RgUggW--9rAO2yckoi~A39bTBcK4gnEeC2A4YrJJeG8FXhMTMiul5O2OeFK-a7ErxMgGBc3GMBXnIQ~~StTO9vLUh2bLeMB~xN5EMsb1lKsZrqDe0mCkd4Hmksuxa5Em3jihgzkSXkr31tR~KlzhOxluRnuR5fyQ0P8piNh-ucwsIzHR~~cNnl4pHMU8oLAVTmZMpGFzPF6dQQ__',
    time: '8 hours ago',
  },
  {
    title:
      'Get Tickets and Pay Per View for IKF Spring Classic Super Fights! Myrtle Beach, SC',
    description:
      'Get the Best Prices on Tickets for the best show in the Grand Strand this Saturday, March 15th! Fights will be at...',
    img: 'https://s3-alpha-sig.figma.com/img/1b66/67cf/809244bc93484e0e2880ede325be2a8d?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aOMyPdjguFIMxX-AM7EUpsQ9Wk0RguAkFqasHU4FoVPNJ9U31stTTOdGmXdVsnccx5-WtnxmuVq--oSoAZZUEDsc8a76JYhcJpiH4PEVoPd7v9Chl~YeCdF~K8D2ibFy-ZpDz-v0k~C18MsN5bApF5FMtTuPMavq-WJXlL7hix-9rjMbhVOO3UmKQvdK~I7YwDI9FQZ3~NFCw--p9Fq5kaCK6vpmVPYTMU482AYgrpSKJ9ul45DZuBjEsRxrTE3hFUa87GHFcwF7HhmI7VIHdkxeZ2xxt1OhbEQQkktKspp6koVAf~7zkj4-QnYjwl4-Y4S--FwEES~Ze11b1bPKPQ__',
    time: '1 day ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: '/news.png',
    time: '8 hours ago',
  },
  {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: 'https://s3-alpha-sig.figma.com/img/18da/24d1/f176376b9bb4073e276aa5cf1e93628f?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=h5V1e8vDGULWVHPPDZY8gwsUgxFil8fGqRSix1bVmENOvTnc-QXjNsxUdDJlfd3Q3zq-FHkIaOJDr5xl2UaxwBSsxObTLtjpJfslZIUGQXvOr2dVlOSwJ3H-d9WdhjJ2qlgC42x~RgUggW--9rAO2yckoi~A39bTBcK4gnEeC2A4YrJJeG8FXhMTMiul5O2OeFK-a7ErxMgGBc3GMBXnIQ~~StTO9vLUh2bLeMB~xN5EMsb1lKsZrqDe0mCkd4Hmksuxa5Em3jihgzkSXkr31tR~KlzhOxluRnuR5fyQ0P8piNh-ucwsIzHR~~cNnl4pHMU8oLAVTmZMpGFzPF6dQQ__',
    time: '8 hours ago',
  },
  {
    title:
      'Get Tickets and Pay Per View for IKF Spring Classic Super Fights! Myrtle Beach, SC',
    description:
      'Get the Best Prices on Tickets for the best show in the Grand Strand this Saturday, March 15th! Fights will be at...',
    img: 'https://s3-alpha-sig.figma.com/img/1b66/67cf/809244bc93484e0e2880ede325be2a8d?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aOMyPdjguFIMxX-AM7EUpsQ9Wk0RguAkFqasHU4FoVPNJ9U31stTTOdGmXdVsnccx5-WtnxmuVq--oSoAZZUEDsc8a76JYhcJpiH4PEVoPd7v9Chl~YeCdF~K8D2ibFy-ZpDz-v0k~C18MsN5bApF5FMtTuPMavq-WJXlL7hix-9rjMbhVOO3UmKQvdK~I7YwDI9FQZ3~NFCw--p9Fq5kaCK6vpmVPYTMU482AYgrpSKJ9ul45DZuBjEsRxrTE3hFUa87GHFcwF7HhmI7VIHdkxeZ2xxt1OhbEQQkktKspp6koVAf~7zkj4-QnYjwl4-Y4S--FwEES~Ze11b1bPKPQ__',
    time: '1 day ago',
  },
]

const NewsPage = () => {
  const [bgImage, setBgImage] = useState('/Cover.png')
  const [currentPage, setCurrentPage] = useState(1)
  const newsPerPage = 9
  useEffect(() => {
    const updateBackground = () => {
      setBgImage(
        window.innerWidth >= 768 ? '/Cover.png' : '/rakning_cover_mobile.png'
      )
    }

    updateBackground()
    window.addEventListener('resize', updateBackground)

    return () => window.removeEventListener('resize', updateBackground)
  }, [])

  const totalPages = Math.ceil(news.length / newsPerPage)
  const indexOfLastNews = currentPage * newsPerPage
  const indexOfFirstNews = indexOfLastNews - newsPerPage
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews)

  return (
    <main className='md:pb-44'>
      <section
        className='w-full py-16 relative bg-cover bg-center'
        style={{
          backgroundImage: `url(${bgImage})`,
          boxShadow: 'inset 0 0 50px rgba(76, 0, 255, 0.2)',
        }}
      >
        <div className='absolute inset-0 bg-black opacity-20'></div>
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <h2 className='text-white text-3xl md:text-4xl font-medium mb-4 uppercase'>
            News
          </h2>
          <p className='text-white text-xl font-medium my-4'>
            Stay up to date with the latest news and announcements from the IKF.
          </p>
        </div>
      </section>
      <section className='container mx-auto py-12 px-4'>
        <div className='flex flex-wrap gap-4'>
          {currentNews.map((item, index) => (
            <div
              key={index}
              className='w-100 mx-auto border border-gray-500 rounded'
            >
              <img
                src={item.img}
                alt=''
                className='w-100 h-60 object-cover rounded'
              />
              <div className='p-4 text-white'>
                <h3 className='text-white text-xl font-bold'>{item.title}</h3>
                <h3 className='text-[#BDBDBD] text-lg font-medium my-2 leading-6'>
                  {item.description}
                </h3>
                <h3 className='text-[#BDBDBD] font-medium'>{item.time}</h3>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        <div className='flex justify-center mt-8 space-x-2'>
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className='px-4 py-2 rounded text-white bg-[#0A1330] cursor-pointer'
            >
              <ArrowLeft />
            </button>
          )}
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded text-white cursor-pointer ${
                currentPage === i + 1 ? 'bg-[#2E133A]' : 'bg-[#0A1330]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className='px-4 py-2 rounded text-white bg-[#0A1330] cursor-pointer'
            >
              <ArrowRight />
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default NewsPage
