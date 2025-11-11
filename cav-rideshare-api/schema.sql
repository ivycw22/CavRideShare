CREATE TABLE User (uva_id VARCHAR(6) PRIMARY KEY, fname VARCHAR(255) NOT NULL, lname VARCHAR(255) NOT NULL, phone_number VARCHAR(15) UNIQUE NOT NULL);
CREATE TABLE Driver (uva_id VARCHAR(6) PRIMARY KEY, license_plate VARCHAR(8) UNIQUE NOT NULL, FOREIGN KEY (uva_id) REFERENCES User(uva_id));
CREATE TABLE Car (license_plate VARCHAR(20) PRIMARY KEY, user_id VARCHAR(6) NOT NULL, make VARCHAR(50) NOT NULL, model VARCHAR(50) NOT NULL, mpg DECIMAL(5,2), max_passengers INT NOT NULL, FOREIGN KEY (user_id) REFERENCES User(uva_id));
CREATE TABLE Location (location_id INT PRIMARY KEY, name VARCHAR(255) NOT NULL, address VARCHAR(255), lat DECIMAL(9,6) NOT NULL, lng DECIMAL(9,6) NOT NULL);
CREATE TABLE Trips (trip_id INT AUTO_INCREMENT PRIMARY KEY, departure_time DATETIME NOT NULL, arrival_location INT NOT NULL, seats_available INT NOT NULL, notes TEXT, start_location INT NOT NULL, trip_duration TIME, arrival_time TIMESTAMP, FOREIGN KEY (arrival_location) REFERENCES Location(location_id), FOREIGN KEY (start_location) REFERENCES Location(location_id));
CREATE TABLE Reviews (review_id INT AUTO_INCREMENT PRIMARY KEY, trip_id INT NOT NULL, comment TEXT, stars INT NOT NULL, FOREIGN KEY (trip_id) REFERENCES Trips(trip_id));
CREATE TABLE Review_Users (review_id INT PRIMARY KEY, reviewer_id VARCHAR(6) NOT NULL, reviewee_id VARCHAR(6) NOT NULL, FOREIGN KEY (review_id) REFERENCES Reviews(review_id), FOREIGN KEY (reviewer_id) REFERENCES User(uva_id), FOREIGN KEY (reviewee_id) REFERENCES User(uva_id));
CREATE TABLE Drives (uva_id VARCHAR(6) NOT NULL, trip_id INT NOT NULL, PRIMARY KEY (trip_id), FOREIGN KEY (uva_id) REFERENCES Driver(uva_id), FOREIGN KEY (trip_id) REFERENCES Trips(trip_id));
CREATE TABLE Rides_In (uva_id VARCHAR(6) NOT NULL, trip_id INT NOT NULL, PRIMARY KEY (uva_id, trip_id), FOREIGN KEY (uva_id) REFERENCES User(uva_id), FOREIGN KEY (trip_id) REFERENCES Trips(trip_id));
CREATE TABLE Contains (trip_id INT NOT NULL, location_id INT NOT NULL, PRIMARY KEY (trip_id, location_id), FOREIGN KEY (trip_id) REFERENCES Trips(trip_id), FOREIGN KEY (location_id) REFERENCES Location(location_id)); 

INSERT INTO `User` (uva_id, fname, lname, phone_number) VALUES ('bi2yn', 'Iris', 'Diaz', '2395889785'), ('rk6bf', 'Elena', 'Kim', '7745415016'), ('fa7yc', 'Troy', 'Miller', '2712066168'), ('xo2bc', 'Vik', 'Evans', '3292215780'), ('ns8ip', 'Ben', 'Young', '5125519547'), ('zp4tu', 'Quinne', 'Sing', '5222127524'), ('yu9nv', 'Ravi', 'Ueda', '8828108964'), ('qv7lq', 'Ben', 'Youngs', '8603852353'), ('pv5fk', 'Kira', 'Rodriguez', '6002758483'), ('ms6ag', 'Sara', 'Cho', '8435721210'), ('lh7rq', 'Xena', 'Baker', '8544949106'), ('yu4rp', 'Finn', 'Evans', '7496557202'), ('yo1ae', 'Owen', 'Gupta', '2214626767'), ('vi7un', 'Ava', 'Diaz', '8322649361'), ('lw2cn', 'Ava', 'Zhang', '7485862203'), ('rw7ak', 'Iria', 'Patel', '2339686485'), ('nl1uu', 'Finn', 'Nguyen', '2659343359'), ('lv4xc', 'Uma', 'Baker', '9767317344'), ('rj3uy', 'Jae', 'Young', '5985773072'), ('rk9du', 'Finn', 'Zhang', '8035958080');
INSERT INTO Car(`license_plate`, `user_id`, `make`, `model`, `mpg`, `max_passengers`) VALUES ('OJ-8028', 'rk6bf', 'Subaru', 'Outback', 29, 4), ('ZY-1462', 'ns8ip', 'Honda', 'Civic', 34, 4), ('FQ-6322', 'lw2cn', 'Toyota', 'Corolla', 33, 4), ('QQ-3250', 'bi2yn', 'Subaru', 'Outback', 29, 4),('KQ-2716', 'yu4rp', 'Toyota', 'Corolla', 33, 4), ('RX-7045', 'qv7lq', 'Kia', 'Soul', 31, 4), ('HS-6571', 'vi7un', 'Honda', 'Civic', 34, 4), ('CI-9295', 'rw7ak', 'Toyota', 'Corolla', 33, 4),('HG-6276', 'yo1ae', 'Tesla', 'Model 3', 120, 4), ('IM-1704', 'lh7rq', 'Subaru', 'Outback', 29, 4);
INSERT INTO `Location` (`location_id`, `name`, `address`, `lat`, `lng`) VALUES (1, 'UVA Rotunda', '1826 University Ave, Charlottesville, VA', 38.0356, -78.5034),
 (2, 'The Corner', '104 14th St NW, Charlottesville, VA', 38.035, -78.5008),
 (3, 'AFC', '450 Whitehead Rd, Charlottesville, VA', 38.0311, -78.5142),
 (4, 'JPJ Arena', '295 Massie Rd, Charlottesville, VA', 38.0478, -78.5125),
 (5, 'Amtrak Station', '810 W Main St, Charlottesville, VA', 38.0344, -78.4948),
 (6, 'Barracks Road', '1117 Emmet St N, Charlottesville, VA', 38.0525, -78.497),
 (7, 'Darden', '100 Darden Blvd, Charlottesville, VA', 38.0551, -78.5152),
 (8, 'UVA Hospital', '1215 Lee St, Charlottesville, VA', 38.0317, -78.5011),
 (9, 'Aldi 5th St', '1738 5th St SW, Charlottesville, VA', 38.011, -78.5013),
 (10, 'Fashion Square', '1600 Rio Rd E, Charlottesville, VA', 38.0745, -78.4768);;
INSERT INTO `Trips` (`trip_id`, `departure_time`, `arrival_location`, `seats_available`, `notes`, `start_location`, `trip_duration`, `arrival_time`) VALUES (20001, '2024-09-21 16:00:00', 2, 3, 'Game day ride', 4, 29, '2024-09-21 16:29:00'),
 (20002, '2024-09-10 05:00:00', 3, 3, '--', 9, 39, '2024-09-10 05:39:00'),
 (20003, '2024-10-17 05:00:00', 1, 2, 'Grocery run', 7, 29, '2024-10-17 05:29:00'),
 (20004, '2024-10-10 14:00:00', 9, 1, 'Airport drop', 4, 39, '2024-10-10 14:39:00'),
 (20005, '2024-09-05 01:00:00', 2, 3, 'Airport drop', 10, 37, '2024-09-05 01:37:00'),
 (20006, '2024-09-15 04:00:00', 6, 2, 'Late night study group', 7, 29, '2024-09-15 04:29:00'),
 (20007, '2024-10-25 03:00:00', 7, 1, 'Game day ride', 3, 32, '2024-10-25 03:32:00'),
 (20008, '2024-09-26 01:00:00', 3, 3, 'Airport drop', 5, 12, '2024-09-26 01:12:00'),
 (20009, '2024-10-24 00:00:00', 5, 3, 'Grocery run', 2, 11, '2024-10-24 00:11:00'),
 (20010, '2024-09-08 04:00:00', 7, 2, 'Late night study group', 1, 28, '2024-09-08 04:28:00'),
 (20011, '2024-10-08 01:00:00', 5, 2, '--', 8, 23, '2024-10-08 01:23:00'),
 (20012, '2024-10-28 22:00:00', 9, 3, 'Morning class run', 8, 29, '2024-10-28 22:29:00'),
 (20013, '2024-09-29 05:00:00', 2, 1, 'Grocery run', 3, 16, '2024-09-29 05:16:00'),
 (20014, '2024-10-05 18:00:00', 1, 2, 'Airport drop', 9, 28, '2024-10-05 18:28:00'),
 (20015, '2024-10-03 23:00:00', 1, 2, 'Airport drop', 4, 8, '2024-10-03 23:08:00'),
 (20016, '2024-10-27 16:00:00', 4, 3, 'Airport drop', 7, 24, '2024-10-27 16:24:00'),
 (20017, '2024-09-28 15:00:00', 7, 2, 'Grocery run', 3, 8, '2024-09-28 15:08:00'),
 (20018, '2024-09-19 06:00:00', 4, 1, '--', 3, 18, '2024-09-19 06:18:00'),
 (20019, '2024-10-03 04:00:00', 4, 2, 'Airport drop', 9, 22, '2024-10-03 04:22:00'),
 (20020, '2024-09-29 22:00:00', 2, 1, 'Game day ride', 9, 20, '2024-09-29 22:20:00');;
INSERT INTO `Driver` (`uva_id`, `license_plate`) VALUES ('rk6bf', 'OJ-8028'), ('ns8ip', 'ZY-1462'), ('lw2cn', 'FQ-6322'), ('bi2yn', 'QQ-3250'), ('yu4rp', 'KQ-2716'), ('qv7lq', 'RX-7045'), ('vi7un', 'HS-6571'), ('rw7ak', 'CI-9295'), ('yo1ae', 'HG-6276'), ('lh7rq', 'IM-1704');;
INSERT INTO `Drives` (`uva_id`, `trip_id`) VALUES ('ns8ip', 20001), ('vi7un', 20002), ('vi7un', 20003), ('rw7ak', 20004), ('ns8ip', 20005), ('rk6bf', 20006), ('lh7rq', 20007), ('vi7un', 20008), ('vi7un', 20009), ('yo1ae', 20010), ('qv7lq', 20011), ('lw2cn', 20012), ('rw7ak', 20013), ('lw2cn', 20014), ('bi2yn', 20015), ('bi2yn', 20016), ('bi2yn', 20017), ('rk6bf', 20018), ('bi2yn', 20019), ('bi2yn', 20020);;
INSERT INTO `Reviews` (`review_id`, `trip_id`, `comment`, `stars`) VALUES (60001, 20002, 'Would ride again.', 4), (60002, 20002, 'Polite passenger.', 5), (60003, 20003, 'On time and friendly.', 4), (60004, 20003, 'On time and friendly.', 4), (60005, 20004, 'Would ride again.', 5), (60006, 20009, 'On time and friendly.', 4), (60007, 20011, 'Safe driving.', 5), (60008, 20011, 'Easy pickup.', 5), (60009, 20013, 'Clean car.', 4), (60010, 20015, 'Would ride again.', 4), (60011, 20016, 'Safe driving.', 4), (60012, 20016, 'Polite passenger.', 4), (60013, 20016, 'Clean car.', 5), (60014, 20017, 'Safe driving.', 4), (60015, 20017, 'On time.', 4), (60016, 20018, 'Clean car.', 4), (60017, 20018, 'Polite passenger.', 5);

INSERT INTO `Review_Users` (`review_id`, `reviewer_id`, `reviewee_id`) VALUES (60001, 'bi2yn', 'vi7un'), (60002, 'vi7un', 'bi2yn'), (60003, 'lh7rq', 'vi7un'), (60004, 'rj3uy', 'vi7un'), (60005, 'rk6bf', 'rw7ak'), (60006, 'yu4rp', 'vi7un'), (60007, 'lw2cn', 'qv7lq'), (60008, 'qv7lq', 'lw2cn'), (60009, 'yo1ae', 'rw7ak'), (60010, 'lh7rq', 'bi2yn'), (60011, 'nl1uu', 'bi2yn'), (60012, 'bi2yn', 'nl1uu'), (60013, 'nl1uu', 'bi2yn'), (60014, 'rk9du', 'bi2yn'), (60015, 'bi2yn', 'rk9du'), (60016, 'yo1ae', 'rk6bf'), (60017, 'rk6bf', 'yo1ae');;

INSERT INTO `Rides_In` (`uva_id`, `trip_id`) VALUES ('vi7un', 20001), ('bi2yn', 20002), ('lh7rq', 20003), ('rk6bf', 20004), ('lw2cn', 20005), ('lh7rq', 20006), ('ms6ag', 20007), ('lh7rq', 20008), ('yu4rp', 20009), ('rw7ak', 20010), ('lw2cn', 20011), ('lv4xc', 20012), ('vi7un', 20013), ('fa7yc', 20014), ('lh7rq', 20015), ('nl1uu', 20016), ('ns8ip', 20017), ('yo1ae', 20018), ('rk6bf', 20019), ('lh7rq', 20020), ('rj3uy', 20003), ('yu9nv', 20006), ('rk9du', 20006), ('yu9nv', 20008), ('lv4xc', 20008), ('yo1ae', 20013), ('yu9nv', 20013), ('nl1uu', 20014), ('zp4tu', 20017), ('rk9du', 20017);;

INSERT INTO `Contains` (`trip_id`, `location_id`) VALUES (20007, 8), (20013, 3), (20002, 1), (20004, 3), (20017, 2), (20010, 6), (20011, 1), (20006, 2), (20012, 3), (20018, 4), (20016, 8), (20020, 7), (20003, 4), (20015, 7), (20014, 1);;

INSERT INTO User (uva_id, fname, lname, phone_number) VALUES ('ab123c','Ava','Kim','8045551234');
 DELETE FROM User WHERE uva_id='ab123c';
 INSERT INTO User (uva_id, fname, lname, phone_number) VALUES ('ab123c','Ava','Kim','8045551234');
 SELECT uva_id, fname, lname, phone_number FROM User WHERE uva_id='ab123c';
 UPDATE User SET phone_number='8045555678' WHERE uva_id='ab123c';
INSERT INTO Driver (uva_id, license_plate) VALUES ('ab123c','UV1234VA');
 DELETE FROM Driver WHERE uva_id='ab123c';
 INSERT INTO Driver (uva_id, license_plate) VALUES ('ab123c','UV1234VA');
 SELECT uva_id, license_plate FROM Driver WHERE uva_id='ab123c';
 UPDATE Driver SET license_plate='VA88TEST' WHERE uva_id='ab123c';
INSERT INTO Car (license_plate, user_id, make, model, mpg, max_passengers) VALUES ('CAR-0001','ab123c','Honda','Civic',33.50,4);
 DELETE FROM Car WHERE license_plate='CAR-0001';
 INSERT INTO Car (license_plate, user_id, make, model, mpg, max_passengers) VALUES ('CAR-0001','ab123c','Honda','Civic',33.50,4);
 SELECT license_plate, user_id, make, model, mpg, max_passengers FROM Car WHERE license_plate='CAR-0001';
 UPDATE Car SET mpg=35.00, max_passengers=5 WHERE license_plate='CAR-0001';
INSERT INTO Location (location_id, name, address, lat, lng) VALUES (11,'UVA Rotunda','1826 University Ave, Charlottesville, VA',38.035600,-78.503400);
DELETE FROM Location WHERE location_id=11;
 INSERT INTO Location (location_id, name, address, lat, lng) VALUES (11,'UVA Rotunda','1826 University Ave, Charlottesville, VA',38.035600,-78.503400);
 SELECT location_id, name, address, lat, lng FROM Location WHERE location_id=11;
 UPDATE Location SET address='1826 University Ave, Charlottesville, VA 22903' WHERE location_id=11;
DELETE FROM Trips WHERE trip_id=2;
 INSERT INTO Trips (departure_time, arrival_location, seats_available, notes, start_location, trip_duration, arrival_time) VALUES ('2024-11-01 10:00:00',2,3,'Morning ride',1,'00:30:00','2024-11-01 10:30:00');
 SELECT trip_id, departure_time, arrival_location, seats_available, notes, start_location, trip_duration, arrival_time FROM Trips WHERE trip_id=1;
 UPDATE Trips SET seats_available=2, notes='Seats filling fast' WHERE trip_id=1;
INSERT INTO Reviews (trip_id, comment, stars) VALUES ((SELECT MIN(trip_id) FROM Trips),'Great ride',5);
 DELETE FROM Reviews WHERE review_id=3;
 SELECT review_id, trip_id, comment, stars FROM Reviews WHERE review_id=1;
 UPDATE Reviews SET comment='Great ride, very safe', stars=5 WHERE review_id=1;
INSERT INTO Review_Users (review_id, reviewer_id, reviewee_id) VALUES ((SELECT MAX(review_id) FROM Reviews),'ab123c','bi2yn');
 DELETE FROM Review_Users WHERE review_id=3;
 SELECT review_id, reviewer_id, reviewee_id FROM Review_Users WHERE review_id=1;
 UPDATE Review_Users SET reviewee_id='ab123c' WHERE review_id=1;
INSERT INTO Drives (uva_id, trip_id) VALUES ('ab123c',(SELECT MAX(trip_id) FROM Trips));
 DELETE FROM Drives WHERE trip_id=3;
 SELECT uva_id, trip_id FROM Drives WHERE trip_id=1;
 UPDATE Drives SET uva_id='cd234d' WHERE trip_id=1;
INSERT INTO Rides_In (uva_id, trip_id) VALUES ('bi2yn',(SELECT MAX(trip_id) FROM Trips));
 DELETE FROM Rides_In WHERE uva_id='bi2yn' AND trip_id=5;
 SELECT uva_id, trip_id FROM Rides_In WHERE trip_id=1;
 UPDATE Rides_In SET uva_id='ab123c' WHERE uva_id='bi2yn' AND trip_id=1;

ALTER TABLE Reviews
ADD CONSTRAINT ck_reviews_stars CHECK (stars BETWEEN 1 AND 5);

ALTER TABLE Trips
ADD CONSTRAINT ck_trips_seats CHECK (seats_available >= 0),
ADD CONSTRAINT ck_trips_duration CHECK (trip_duration IS NULL OR trip_duration > 0);

DELIMITER $$
CREATE PROCEDURE sp_book_trip(IN p_rider VARCHAR(6), IN p_trip INT)
BEGIN
DECLARE v_remaining INT;
SELECT seats_available INTO v_remaining FROM Trips WHERE trip_id = p_trip;
IF EXISTS (SELECT 1 FROM Rides_In WHERE uva_id = p_rider AND trip_id = p_trip) THEN
SELECT 'Already booked' AS message;
ELSEIF v_remaining > 0 THEN
INSERT INTO Rides_In(uva_id, trip_id) VALUES (p_rider, p_trip);
UPDATE Trips SET seats_available = seats_available - 1 WHERE trip_id = p_trip;
SELECT 'Booked' AS message;
ELSE
SELECT 'Trip is full' AS message;
END IF;
END$$
DELIMITER ;
