"use client"; // Add this line at the top

import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChair,
  faClock,
  faChartBar,
  faFilm,
  faHome,
  faHamburger,
  faShoppingCart,
  faUsers,
  faTags,
  faNewspaper,
  faEnvelope,
  faPalette,
  faDollarSign,
  faChevronDown,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import styles from './Sidebar.module.css'; // Import your CSS module
import logo from '../../../public/img/color-logo.png'; // Adjust the path if necessary
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation'; // Thay thế useRouter bằng usePathname

const Sidebar = () => {
   const pathname = usePathname(); // Lấy thông tin về route hiện tại

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <a href="#"><img src={logo.src} alt="Admin Logo" className={styles.logoImage}/></a>
        
      </div>

      <ul className={styles.menuList}>
        {menuItems.map((item) => (
          <DropdownMenu
            key={item.href}
            item={item}
            isActive={pathname === item.href} // Kiểm tra active
          />
        ))}
      </ul>
    </nav>
  );
};

const DropdownMenu = ({ item, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <li className={`${styles.menuItem} ${isActive ? styles.active : ''}`}> {/* Thêm class 'active' nếu là mục đang mở */}
      <Link href={`${item.href}`} className={styles.link}>
        <FontAwesomeIcon icon={item.icon} className={`${styles.icon} ${styles.svgIcon}`} />
        <span className={styles.text}>{item.text}</span>
      </Link>
    </li>
  );
  
};
  

// Sidebar menu items with icons
const menuItems = [
  { href: '/admin/thongke', text: 'Thống Kê', icon: faChartBar },
  { href: '/admin/phim', text: 'Phim', icon: faFilm },
  { href: '/admin/cachieu', text: 'Ca Chiếu Phim', icon: faClock },
  { href: '/admin/phong-phim', text: 'Phòng Phim', icon: faHome },
  { href: '/admin/loai-phong', text: 'Loại Phòng', icon: faPalette },
  { href: '/admin/loai-ghe', text: 'Loại ghế',     icon:faChair },
  { href: '/admin/gia-ghe', text: 'Giá ghế', icon: faDollarSign },
  { href: '/admin/do-an', text: 'Đồ Ăn', icon: faHamburger },
  { href: '/admin/don-hang', text: 'Đơn Hàng', icon: faShoppingCart },
  { href: '/admin/khach-hang', text: 'Khách Hàng', icon: faUsers },
  { href: '/admin/the-loai-phim', text: 'Thể Loại Phim', icon: faTags },
  { href: '/admin/tin-tuc', text: 'Tin Tức', icon: faNewspaper },
  { href: '/admin/lien-he', text: 'Liên Hệ', icon: faEnvelope },
  { href: '/admin/banner', text: 'Banner', icon: faImage },
];
export default Sidebar;