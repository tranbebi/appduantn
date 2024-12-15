"use client";
import { useEffect, useMemo, useState } from "react";
import "./fimdetail.css";
import Food from "@/app/components/food";
import { useDispatch, useSelector } from "react-redux";
import { addSeat, clearCart } from "@/redux/slice/cartSlice";
import {
  clearMovieInfo,
  updateCaChieuID,
  updateGioChieu,
  updateNgayChieu,
  updatePhongChieu,
  updateTenPhim,
} from "@/redux/slice/filmSlice";
import Link from "next/link";
export default function filmdetail({ params }) {


  const { cart } = useSelector((state) => state.cart);
  const id = params.id;
  // const [ngaychieuSelected, setNgayChieuSelected] = useState("");

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);


  const [show, setShow] = useState(false);
  const [phimChitiet, setPhimChitiet] = useState([]);
  const [ngayHieuLuc, setNgayHieuLuc] = useState("");
  const [cachieu, setCaChieu] = useState([]);
  const [gheData, setGheData] = useState([]);
  const [loaighe, setloaiGhe] = useState([]);
  const [timeleft, setTimeLeft] = useState(10 * 60);

  useEffect(() => {
    if (timeleft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [timeleft]);

  const [phongchieuid, setPhongChieuid] = useState([]);
  const [phimCachieu, setPhimCachieu] = useState([]);
  const [phongchieu, setPhongChieu] = useState([]);
  const [phongchieudata, setPhongChieuData] = useState([]);
  const [ngaychieuSelected, setNgayChieuSelected] = useState("");
  const [giochieu, setgiochieu] = useState([]);
  const [foodshow, setFoodShow] = useState(false);
  const [seatSelected, setSeatSelected] = useState([]);
  const [giaghedata, setGiaghedata] = useState([]);
  const [giaghe, setGiaghe] = useState(0);
  const [dataSelected, setDataSelected] = useState(false)
  const minutes = Math.floor(timeleft / 60);
  const seconds = timeleft % 60;

  const [showTrailer, setShowTrailer] = useState(false);

  const toggleTrailer = () => {
    setShowTrailer(!showTrailer);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          phimChitietRes,
          caChieuRes,
          phongchieuRes,
          seatRes,
          seatModelRes,
          giagheRes,
        ] = await Promise.all([
          fetch(`http://localhost:3000/phim/${id}`),
          fetch(`http://localhost:3000/xuatchieu`),
          fetch(`http://localhost:3000/phongchieu`),
          fetch(`http://localhost:3000/ghe`),
          fetch(`http://localhost:3000/loaighe`),
          fetch(`http://localhost:3000/giaghe`),
        ]);

        if (!phimChitietRes.ok || !caChieuRes.ok || !phongchieuRes.ok || !seatRes.ok || !seatModelRes.ok || !giagheRes.ok) {
          throw new Error("Có lỗi xảy ra khi lấy dữ liệu");
        }

        const [
          phimChitietData,
          caChieuData,
          phongchieuData,
          seatData,
          seatModelData,
          giagheData,
        ] = await Promise.all([
          phimChitietRes.json(),
          caChieuRes.json(),
          phongchieuRes.json(),
          seatRes.json(),
          seatModelRes.json(),
          giagheRes.json(),
        ]);

        setPhimChitiet(phimChitietData);
        dispatch(updateTenPhim(phimChitietData.tenphim));

        const ngayHieuLuc = new Date(phimChitietData.ngayhieuluc).toLocaleDateString("vi-VN");
        setNgayHieuLuc(ngayHieuLuc);

        setCaChieu(caChieuData);
        setPhongChieu(phongchieuData);
        setGheData(seatData);
        setloaiGhe(seatModelData);
        setGiaghedata(giagheData);

      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    console.log("gio hang cap nhap", cart);
  }, [cart]);

  useEffect(() => {
    if (id && cachieu && Array.isArray(cachieu)) {
      const foundPhim = cachieu.filter((item) => item.phim_id === id);
      setPhimCachieu(foundPhim || null);
    } else {
      setPhimCachieu(null);
    }
  }, [id, cachieu]);

  useEffect(() => {
    if (phongchieudata?._id) {
      setPhongChieuid(phongchieudata._id);
    }
  }, [phongchieudata, setPhongChieuid]);

  const organizeSeatsByRow = (gheData, phongchieu_id) => {
    return gheData
      .filter((ghe) => ghe.phongchieu_id === phongchieu_id)
      .reduce((acc, ghe) => {
        const row = ghe.hang;
        if (!acc[row]) {
          acc[row] = [];
        }
        acc[row].push(ghe);
        return acc;
      }, {});
  };

  const seatsByRow = useMemo(() => {
    const rows = organizeSeatsByRow(gheData, phongchieuid);
    Object.keys(rows).forEach((row) => {
      rows[row].sort((a, b) => a.cot - b.cot);
    });
    return rows;
  }, [gheData, phongchieuid]);

  const MAX_SEATS_TO_SHOW = 5;
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const ngayChieuParam = queryParams.get('ngaychieu');
    const giochieu = queryParams.get('giochieu');

    if (ngayChieuParam) {
      setNgayChieuSelected(ngayChieuParam);
    }
    if (giochieu) {
      setgiochieu(giochieu);
      setShow(true);

    }
  }, []);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 4);

  const phimHienTai = phimCachieu.filter((item) => {
    const ngayChieu = new Date(item.ngaychieu);
    ngayChieu.setHours(0, 0, 0, 0);
    return ngayChieu >= today && ngayChieu <= endDate;
  });
  const handleSeatClick = (ghe, seat, loaigheItem, giaLoaighe, isSelected, gheData) => {
    const loaighe = loaigheItem.loaighe;

    // Lọc giá theo loại ghế
    const giatheoLoaighe = giaLoaighe.filter(
      (item) => item.loaighe_id.loaighe === loaighe
    );

    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    // Hàm kiểm tra khung giờ
    const KhungGio = (startTime, endTime) => {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      return (
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes
      );
    };

    // Hàm kiểm tra ngày cuối tuần hoặc ngày lễ
    const CuoiTuanLe = (weekendandHoliday) => {
      const today = new Date();
      const dayOfWeek = today.getDay();

      const isCuoituan = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

      const holidays = ['2024-12-25', '2024-01-01'];
      const todayString = today.toISOString().split('T')[0];
      const isHoliday = holidays.includes(todayString) ? 1 : 0;

      return weekendandHoliday === isCuoituan || weekendandHoliday === isHoliday;
    };

    const khungGioPhuHop = giatheoLoaighe.find((item) => {
      const startTime = item.giobatdau;
      const endTime = item.gioketthuc;

      // Kiểm tra dữ liệu đầu vào
      if (!startTime || !endTime) {
        console.error('Dữ liệu giờ bắt đầu hoặc giờ kết thúc không hợp lệ.');
        return false;
      }

      // Kiểm tra khung giờ hợp lệ
      return KhungGio(startTime, endTime);
    });

    const khungGioHoacNgayDacBiet =
      khungGioPhuHop ||
      giatheoLoaighe.find((item) => CuoiTuanLe(item.ngaycuoituan));

    const gia =
      khungGioHoacNgayDacBiet?.giaghe ||
      (giatheoLoaighe.length > 0 ? giatheoLoaighe[0].giaghe : 0);

    if (khungGioHoacNgayDacBiet) {
      const { giobatdau, gioketthuc, giaghe } = khungGioHoacNgayDacBiet;
      console.log(
        `Khung giờ hiện tại: ${giobatdau} - ${gioketthuc || 'Ngày đặc biệt'}, Giá ghế: ${giaghe} , Loại ghế: ${loaighe}`
      );
    } else {
      console.log(`Không có khung giờ phù hợp. Giá mặc định: ${gia}`);
    }



    const handleDoubleSeat = () => {
      const firstSeat = seat;
      const seatNumber = parseInt(seat.substring(1));

      const secondSeat = `${seat.charAt(0)}${seatNumber % 2 === 0 ? seatNumber - 1 : seatNumber + 1}`;

      const isFirstSeatSelected = seatSelected.includes(firstSeat);
      const isSecondSeatSelected = seatSelected.includes(secondSeat);

      if (isFirstSeatSelected || isSecondSeatSelected) {
        setSeatSelected((prevSeats) =>
          prevSeats.filter(
            (selected) => selected !== firstSeat && selected !== secondSeat
          )
        );

        dispatch(clearCart());
        setGiaghe((prevTotal) => prevTotal - gia * 2);
      } else {
        const isSecondSeatAvailable = gheData.some(
          (g) => `${g.hang}${g.cot}` === secondSeat
        );

        if (isSecondSeatAvailable) {
          setSeatSelected((prevSeats) => [
            ...prevSeats,
            firstSeat,
            secondSeat,
          ]);
          dispatch(
            addSeat({
              _id: ghe._id,
              seat: [firstSeat, secondSeat],
              gia: gia * 1,
            })
          );
          setGiaghe((prevTotal) => prevTotal + gia * 2);
        } else {
          alert("Ghế đôi không hợp lệ! Ghế liền kề đã bị chọn.");
        }
      }
    };


    const handleSingleSeat = () => {
      const seatNumber = parseInt(seat.substring(1));
      const seatRow = seat.charAt(0);

      const isSeatSelected = seatSelected.includes(seat);

      if (isSeatSelected) {
        const selectedSeatsInRow = seatSelected
          .filter((selectedSeat) => selectedSeat.charAt(0) === seatRow)
          .map((selectedSeat) => parseInt(selectedSeat.substring(1)))
          .sort((a, b) => a - b);

        const lastSelectedSeat = selectedSeatsInRow[selectedSeatsInRow.length - 1];

        if (seatNumber !== lastSelectedSeat) {
          alert(`Bạn phải bỏ ghế ${seatRow}${lastSelectedSeat} trước!`);
          return;
        }

        // Bỏ ghế
        setSeatSelected((prevSeats) => prevSeats.filter((selected) => selected !== seat));
        dispatch(clearCart());
        setGiaghe((prevTotal) => prevTotal - gia);
      } else {
        const selectedSeatsInRow = seatSelected
          .filter((selectedSeat) => selectedSeat.charAt(0) === seatRow)
          .map((selectedSeat) => parseInt(selectedSeat.substring(1)))
          .sort((a, b) => a - b);

        const lastSelectedSeat = selectedSeatsInRow.length > 0
          ? selectedSeatsInRow[selectedSeatsInRow.length - 1]
          : 0;

        if (lastSelectedSeat === 0 && seatNumber !== 1) {
          alert(`Bạn chỉ có thể chọn ghế ${seatRow}1`);
          return;
        } else if (seatNumber !== lastSelectedSeat + 1) {
          alert(`Bạn chỉ có thể chọn ghế ${seatRow}${lastSelectedSeat + 1}`);
          return;
        }

        const selectedSeatData = gheData.find((g) => `${g.hang}${g.cot}` === seat);

        if (selectedSeatData) {
          // Chọn ghế
          setSeatSelected((prevSeats) => [...prevSeats, seat]);
          dispatch(
            addSeat({
              _id: selectedSeatData._id,
              seat: [seat],
              gia: gia,
            })
          );
          setGiaghe((prevTotal) => prevTotal + gia);
        } else {
          alert("Ghế không hợp lệ!");
        }
      }
    };

    // Phân loại ghế
    if (loaigheItem && loaigheItem.loaighe === "Ghế Đôi") {
      handleDoubleSeat();
    } else {
      handleSingleSeat();
    }
  };
  return (
    <>
      <section className="film-detail">
  <div className="card ">
    <div className="img-container  position-relative">
      <img
        src={`http://localhost:3000/img/phims/${phimChitiet.img}`}
        alt="Ảnh nền phim"
        className="film-img"
      />
    </div>

    <div className="card-body film-details">
      <div className="img-overlay ">
        <img
          src={`http://localhost:3000/img/phims/${phimChitiet.img}`}
          alt="Ảnh chính phim"
          className="film-img-small"
        />
      </div>

      <div className="title-overlay ms-lg-3 text-white">
        <h1 className="card-title">
          {phimChitiet.tenphim || "Loading..."}
        </h1>
        <ul>
          <li><a href="#">Kinh dị</a></li>
          <li><a href="#">America</a></li>
          <li><a href="#">{phimChitiet.thoiluong}</a></li>
          <li><a href="#">{phimChitiet.daodien}</a></li>
        </ul>
        <p className="card-text">
          {phimChitiet.dienvien}
        </p>
        <p className="card-text">
          Khởi chiếu: {ngayHieuLuc}
        </p>
        <p className="card-text">
          <small>
            {phimChitiet && phimChitiet.noidung
              ? phimChitiet.noidung.length > 100
                ? `${phimChitiet.noidung.slice(0, 100)}...`
                : phimChitiet.noidung
              : "Loading..."}
          </small>
        </p>
        <p className="card-node text-danger">
          Kiểm duyệt: T18 - Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (18+)
        </p>
        <div className="view-detail d-flex">
          <p className="card-text mt-2">Chi tiết nội dung</p>
          <button
            onClick={toggleTrailer}
            className="btn ms-3 rounded-pill bg-dark text-warning border border-warning"
          >
            Xem Trailer
          </button>
        </div>
      </div>
    </div>
  </div>

  {showTrailer && (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Trailer: {phimChitiet.tenphim}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={toggleTrailer}
            ></button>
          </div>
          <div className="modal-body">
            <div className="embed-responsive embed-responsive-16by9">
              <iframe
                width="100%"
                height="500"
                src={phimChitiet.trailler}
                title={phimChitiet.tenphim || "Trailer"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</section>


      <div className="date-order">
        <div className="date text-light">
          {phimHienTai.length > 0 ? (
            phimHienTai
              .sort((a, b) => new Date(a.ngaychieu) - new Date(b.ngaychieu))
              .map((item) => (
                <div
                  className={`text  ${ngaychieuSelected === (item.ngaychieu) ? 'selected' : ''}`}
                  key={item.id}
                  onClick={() => {
                    setDataSelected(item._id);
                    setNgayChieuSelected(item.ngaychieu);
                    dispatch(updateNgayChieu(item.ngaychieu));

                  }}
                >
                  <p>Tháng {new Date(item.ngaychieu).getMonth() + 1}</p>
                  <h2>{new Date(item.ngaychieu).getDate()}</h2>
                  <p>
                    {
                      [
                        "Chủ Nhật",
                        "Thứ Hai",
                        "Thứ Ba",
                        "Thứ Tư",
                        "Thứ Năm",
                        "Thứ Sáu",
                        "Thứ Bảy",
                      ][new Date(item.ngaychieu).getDay()]
                    }
                  </p>
                </div>
              ))
          ) : (
            <p className="mt-2">Phim tạm thời chưa có ca chiếu.</p>
          )}
        </div>
        <div className="note">
          <p>
            Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h
            và Khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.
          </p>
          <div className="thoigian_chieu">
            {phimCachieu.length > 0 ? (
              phimCachieu.map((item) => {
                const phongchieudt = phongchieu.find(
                  (phong) => phong._id === item.phongchieu_id
                );
                if (item.ngaychieu === ngaychieuSelected) {
                  return (
                    <button
                      key={item._id}
                      className="chonthoigian"
                      type="button"
                      onClick={() => {
                        setShow(true);
                        dispatch(updateCaChieuID(item._id))
                        setgiochieu(item.giobatdau);
                        setPhongChieuData(phongchieudt);
                        dispatch(updateGioChieu(item.giobatdau));
                        dispatch(
                          updatePhongChieu(phongchieudt?.tenphong || null)
                        );
                      }}
                    >
                      {item.giobatdau}
                    </button>
                  );
                }
                return null;
              })
            ) : (
              <p>Chưa có thông tin phim.</p>
            )}
          </div>
        </div>
      </div>
      {show && (
        <>
          <section className="film-sit-order">
            <div className="sit-header d-flex justify-content-around">
              <span className="fs-5 font-monsterat">
                Giờ chiếu : <strong>{giochieu}</strong>
              </span>
              <p className="s-p-2">
                {minutes.toString().padStart(2, "0")} :{" "}
                {seconds.toString().padStart(2, "0")}
              </p>
            </div>
            <div className="sit-img d-flex justify-content-center">
              <img src="../../img/image 35.png" alt="decorimg" />
            </div>
            <div className="seat-content">
              <p className="seat-title">
                {phongchieudata?.tenphong || "không có dữ liệu"}
              </p>
              <div className="siting-order">
                <table className="siting-table">
                  <tbody>
                    {Object.entries(seatsByRow)
                      .sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
                      .map(([row, seats]) => (
                        <div key={row}>
                          <table>
                            <tbody>
                              <tr>
                                {seats.map((ghe) => {
                                  const seat = `${ghe.hang}${ghe.cot}`;
                                  const isSelected = seatSelected.includes(seat);
                                  const loaigheItem = loaighe.find(
                                    (item) => item._id === ghe.loaighe_id
                                  );
                                  const giaLoaighe = giaghedata;
                                  let style = {};
                                  if (loaigheItem) {
                                    style.backgroundColor = loaigheItem.mau;
                                  }
                                  if (isSelected) {
                                    style.backgroundColor = "#005AD8";
                                    style.color = "white";
                                  }
                                  return (
                                    <td
                                      key={ghe._id}
                                      style={{
                                        ...style,
                                        textAlign: "center",
                                        fontSize: "16px",
                                        padding: "5px",
                                        cursor: "pointer",
                                        border: "1px solid #ccc",
                                        margin: "3px",
                                      }}
                                      onClick={() =>
                                        handleSeatClick(ghe, seat, loaigheItem, giaLoaighe, isSelected, gheData)
                                      }
                                    >
                                      {seat}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                  </tbody>
                </table>
              </div>
              {/* <div className="seat-notice d-flex justify-content-center gap-5 mt-3 align-center">
                <div className="note d-flex gap-2">
                  <p className="box-color-1">X</p>
                  <p>Đã đặt</p>
                </div>
                <div className="note d-flex gap-2">
                  <p className="box-color-2"></p>
                  <p>Ghế bạn chọn</p>
                </div>
                <div className="note d-flex gap-2">
                  <p className="box-color-3"></p>
                  <p>ghế thường</p>
                </div>
                <div className="note d-flex gap-2">
                  <p className="box-color-4"></p>
                  <p>Ghế VIP</p>
                </div>
                <div className="note d-flex gap-2">
                  <p className="box-color-5"></p>
                  <p>Ghế đôi</p>
                </div>
              </div> */}
              <div className="d-flex justify-content-center text-light mt-1">
                <p>Giá ghế thay đổi theo từng khung giờ. Quý khách vui lòng tham khảo trang <Link href={"/ticket"} style={{ textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>Giá vé</Link> để biết thêm thông tin</p>
              </div>
              <div className="seat-checkout d-flex justify-content-around gap-3 mt-3 mb-3 align-items-center flex-wrap ">
                <div className="seat-bill">
                  <p className="seat-selected">
                    Ghế đã chọn:
                    <span>
                      {seatSelected.length > MAX_SEATS_TO_SHOW
                        ? `${seatSelected
                          .slice(0, MAX_SEATS_TO_SHOW)
                          .join(", ")} ...`
                        : seatSelected.join(", ")}
                    </span>
                  </p>
                  <p className="seat-total-price">
                    Tổng tiền: <span>{giaghe.toLocaleString()} VND</span>{" "}
                  </p>
                </div>
                <div className="seat-btn">
                  <button
                    className="back-btn"
                    onClick={() => {
                      setShow(false);
                      setTimeLeft(10 * 60);
                      setFoodShow(false);
                      setSeatSelected([]);
                      dispatch(clearCart());
                      dispatch(clearMovieInfo());
                      setGiaghe(0)
                    }}
                  >
                    Quay lại
                  </button>
                  <button
                    className="continue-btn"
                    onClick={() => setFoodShow(true)}
                    disabled={seatSelected.length === 0}
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            </div>
          </section>
          {foodshow && (
            <>
              <Food />
            </>
          )}
        </>
      )}
    </>
  );
}