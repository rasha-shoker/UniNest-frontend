export const dormsData = [
    {
        dorm_id: 101,
        dorm_name: "Bahman Area Student Housing",
        university_name: "MU",
        city: "Beirut",
        area: "Haret Hreik",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Affordable housing near Al Maaref University.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 70 111 222",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/bahman.jpg",
        images: [
            {
                image_id: 10101,
                dorm_id: 101,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/bahman.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Private Nearby",
        gender: "Male / Female",
        distance: "7 minutes from Al Maaref University",
        availability_status: "Available",

        main_room_type: "Single Room",
        base_price: 250,

        rooms: [
            {
                room_id: 1011,
                dorm_id: 101,
                room_number: "101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 250,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 1012,
                dorm_id: 101,
                room_number: "102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 200,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 1013,
                dorm_id: 101,
                room_number: "103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 150,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Kitchen Access", "Laundry"]
    },

    {
        dorm_id: 102,
        dorm_name: "Ghobeiry Student Apartments",
        university_name: "MU",
        city: "Beirut",
        area: "Ghobeiry - Near Airport Road",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Shared and private apartments for students with affordable prices near MU.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 70 333 444",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/ghobeiry.jpg",
        images: [
            {
                image_id: 10201,
                dorm_id: 102,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/ghobeiry.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Private Nearby",
        gender: "Male / Female",
        distance: "5 minutes from Al Maaref University",
        availability_status: "Available",

        main_room_type: "Double Room",
        base_price: 200,

        rooms: [
            {
                room_id: 1021,
                dorm_id: 102,
                room_number: "201",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 230,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 1022,
                dorm_id: 102,
                room_number: "202",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 180,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 1023,
                dorm_id: 102,
                room_number: "203",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 140,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Comfortable Rooms", "Kitchen Access"]
    },

    {
        dorm_id: 201,
        dorm_name: "AUB Student Housing",
        university_name: "AUB",
        city: "Beirut",
        area: "Ras Beirut",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Official AUB dormitories.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 1 350 000",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/aub-new.jpg",
        images: [
            {
                image_id: 20101,
                dorm_id: 201,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/aub-new.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Official",
        gender: "Male / Female",
        distance: "Inside AUB Campus",
        availability_status: "Available",

        main_room_type: "Single Room",
        base_price: 600,

        rooms: [
            {
                room_id: 2011,
                dorm_id: 201,
                room_number: "A101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 600,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 2012,
                dorm_id: 201,
                room_number: "A102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 400,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 2013,
                dorm_id: 201,
                room_number: "A103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 300,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Safe Environment", "Laundry"]
    },

    {
        dorm_id: 202,
        dorm_name: "Hamra Student Apartments",
        university_name: "AUB",
        city: "Beirut",
        area: "Hamra",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Apartments near AUB.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 71 555 666",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/aub2.jpg",
        images: [
            {
                image_id: 20201,
                dorm_id: 202,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/aub2.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Private Nearby",
        gender: "Male / Female",
        distance: "5 minutes from AUB",
        availability_status: "Available",

        main_room_type: "Double Room",
        base_price: 400,

        rooms: [
            {
                room_id: 2021,
                dorm_id: 202,
                room_number: "H101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 400,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 2022,
                dorm_id: 202,
                room_number: "H102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 300,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 2023,
                dorm_id: 202,
                room_number: "H103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 250,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Kitchen Access"]
    },

    {
        dorm_id: 301,
        dorm_name: "LAU Beirut Dorms",
        university_name: "LAU",
        city: "Beirut",
        area: "Koreitem",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Official LAU dorms.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 1 786 456",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/lau1.jpg",
        images: [
            {
                image_id: 30101,
                dorm_id: 301,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/lau1.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Official",
        gender: "Male / Female",
        distance: "2 minutes from LAU Beirut",
        availability_status: "Available",

        main_room_type: "Single Room",
        base_price: 550,

        rooms: [
            {
                room_id: 3011,
                dorm_id: 301,
                room_number: "L101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 550,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 3012,
                dorm_id: 301,
                room_number: "L102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 350,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 3013,
                dorm_id: 301,
                room_number: "L103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 280,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Laundry", "Safe Environment"]
    },

    {
        dorm_id: 304,
        dorm_name: "LAU Byblos Dorms",
        university_name: "LAU",
        city: "Byblos",
        area: "Blat - Byblos",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Official LAU Byblos dormitories.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 9 547 254",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/lau-new.jpg",
        images: [
            {
                image_id: 30401,
                dorm_id: 304,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/lau-new.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Official",
        gender: "Male / Female",
        distance: "Inside LAU Byblos Campus",
        availability_status: "Available",

        main_room_type: "Double Room",
        base_price: 300,

        rooms: [
            {
                room_id: 3041,
                dorm_id: 304,
                room_number: "B101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 300,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 3042,
                dorm_id: 304,
                room_number: "B102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 250,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 3043,
                dorm_id: 304,
                room_number: "B103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 180,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Laundry", "Safe Environment"]
    },

    {
        dorm_id: 401,
        dorm_name: "LU Hadath Dorms",
        university_name: "LU",
        city: "Hadath",
        area: "Hadath Campus",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Official LU housing.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 5 000 111",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/lu1.jpg",
        images: [
            {
                image_id: 40101,
                dorm_id: 401,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/lu1.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Official",
        gender: "Male / Female",
        distance: "Inside LU Hadath Campus",
        availability_status: "Available",

        main_room_type: "Single Room",
        base_price: 220,

        rooms: [
            {
                room_id: 4011,
                dorm_id: 401,
                room_number: "LU101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 220,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 4012,
                dorm_id: 401,
                room_number: "LU102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 180,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 4013,
                dorm_id: 401,
                room_number: "LU103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 140,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Study-Friendly"]
    },

    {
        dorm_id: 402,
        dorm_name: "LU Fanar Student Residence",
        university_name: "LU",
        city: "Fanar",
        area: "Fanar Campus",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Student residence near Lebanese University Fanar campus.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 4 123 456",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/lu-fanar.jpg",
        images: [
            {
                image_id: 40201,
                dorm_id: 402,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/lu-fanar.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Official",
        gender: "Male / Female",
        distance: "4 minutes from LU Fanar",
        availability_status: "Available",

        main_room_type: "Double Room",
        base_price: 210,

        rooms: [
            {
                room_id: 4021,
                dorm_id: 402,
                room_number: "F101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 240,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 4022,
                dorm_id: 402,
                room_number: "F102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 210,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 4023,
                dorm_id: 402,
                room_number: "F103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 170,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Safe Environment", "Study-Friendly"]
    },

    {
        dorm_id: 403,
        dorm_name: "LU Ras Maska Housing",
        university_name: "LU",
        city: "Ras Maska",
        area: "Ras Maska",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Affordable housing option for students near LU Ras Maska.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 6 987 654",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/lu1.jpg",
        images: [
            {
                image_id: 40301,
                dorm_id: 403,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/lu1.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Private Nearby",
        gender: "Male / Female",
        distance: "6 minutes from LU Ras Maska",
        availability_status: "Available",

        main_room_type: "Triple Room",
        base_price: 160,

        rooms: [
            {
                room_id: 4031,
                dorm_id: 403,
                room_number: "R101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 220,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 4032,
                dorm_id: 403,
                room_number: "R102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 180,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 4033,
                dorm_id: 403,
                room_number: "R103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 160,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Kitchen Access", "Laundry"]
    },

    {
        dorm_id: 501,
        dorm_name: "UA Hadath Housing",
        university_name: "UA",
        city: "Hadath",
        area: "Hadath",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Housing near Antonine University.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 5 927 000",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/ua1.jpg",
        images: [
            {
                image_id: 50101,
                dorm_id: 501,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/ua1.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Official",
        gender: "Male / Female",
        distance: "3 minutes from UA Hadath",
        availability_status: "Available",

        main_room_type: "Single Room",
        base_price: 300,

        rooms: [
            {
                room_id: 5011,
                dorm_id: 501,
                room_number: "UA101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 300,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 5012,
                dorm_id: 501,
                room_number: "UA102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 220,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 5013,
                dorm_id: 501,
                room_number: "UA103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 180,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Safe Environment"]
    },

    {
        dorm_id: 502,
        dorm_name: "Zahle Student Apartments",
        university_name: "UA",
        city: "Zahle",
        area: "Zahle",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Affordable apartments near UA Zahle campus.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 8 777 222",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/ua2.jpg",
        images: [
            {
                image_id: 50201,
                dorm_id: 502,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/ua2.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Private Nearby",
        gender: "Male / Female",
        distance: "8 minutes from UA Zahle",
        availability_status: "Available",

        main_room_type: "Double Room",
        base_price: 170,

        rooms: [
            {
                room_id: 5021,
                dorm_id: 502,
                room_number: "Z101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 170,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 5022,
                dorm_id: 502,
                room_number: "Z102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 140,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 5023,
                dorm_id: 502,
                room_number: "Z103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 120,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Kitchen Access", "Comfortable Rooms"]
    },

    {
        dorm_id: 503,
        dorm_name: "UA Zgharta Student Housing",
        university_name: "UA",
        city: "Zgharta",
        area: "Zgharta",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Student housing option near Antonine University Zgharta.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 6 555 333",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/ua1.jpg",
        images: [
            {
                image_id: 50301,
                dorm_id: 503,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/ua1.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Private Nearby",
        gender: "Male / Female",
        distance: "5 minutes from UA Zgharta",
        availability_status: "Available",

        main_room_type: "Single Room",
        base_price: 190,

        rooms: [
            {
                room_id: 5031,
                dorm_id: 503,
                room_number: "ZG101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 190,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 5032,
                dorm_id: 503,
                room_number: "ZG102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 160,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 5033,
                dorm_id: 503,
                room_number: "ZG103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 130,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Safe Environment", "Kitchen Access"]
    },

    {
        dorm_id: 504,
        dorm_name: "Zahle Girls Residence",
        university_name: "UA",
        city: "Zahle",
        area: "Zahle Center",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Comfortable student residence in Zahle near Antonine University.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 8 555 444",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/ua-zahle2.jpg",
        images: [
            {
                image_id: 50401,
                dorm_id: 504,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/ua-zahle2.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Private Nearby",
        gender: "Female",
        distance: "6 minutes from UA Zahle",
        availability_status: "Available",

        main_room_type: "Single Room",
        base_price: 210,

        rooms: [
            {
                room_id: 5041,
                dorm_id: 504,
                room_number: "G101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 210,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 5042,
                dorm_id: 504,
                room_number: "G102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 170,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 5043,
                dorm_id: 504,
                room_number: "G103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 0,
                occupancy_limit: 3,
                room_price: 140,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Laundry", "Safe Environment"]
    },

    {
        dorm_id: 601,
        dorm_name: "USJ Residence",
        university_name: "USJ",
        city: "Beirut",
        area: "Rue de Damas",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Official USJ residence.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 1 421 000",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/usj1.jpg",
        images: [
            {
                image_id: 60101,
                dorm_id: 601,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/usj1.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Official",
        gender: "Male / Female",
        distance: "Inside USJ Area",
        availability_status: "Full",

        main_room_type: "Triple Room",
        base_price: 260,

        rooms: [
            {
                room_id: 6011,
                dorm_id: 601,
                room_number: "USJ101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 1,
                occupancy_limit: 1,
                room_price: 420,
                availability_status: "Full",
                facilities: []
            },
            {
                room_id: 6012,
                dorm_id: 601,
                room_number: "USJ102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 2,
                occupancy_limit: 2,
                room_price: 300,
                availability_status: "Full",
                facilities: []
            },
            {
                room_id: 6013,
                dorm_id: 601,
                room_number: "USJ103",
                room_type: "Triple Room",
                room_capacity: 3,
                current_occupancy: 3,
                occupancy_limit: 3,
                room_price: 260,
                availability_status: "Full",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Laundry", "Safe Environment"]
    },

    {
        dorm_id: 602,
        dorm_name: "USJ Modern Student Loft",
        university_name: "USJ",
        city: "Beirut",
        area: "Achrafieh",
        street: "",
        building_number: "",
        gps_location: "",
        dorm_description: "Modern loft-style student housing near USJ with premium facilities.",
        eligibility_requirements: "Available for students and employees with valid identification documents.",
        contact_email: "",
        contact_phone: "+961 1 222 888",
        rating: 0,
        created_at: "",
        admin_id: 1,

        image_url: "images/usj5.jpg",
        images: [
            {
                image_id: 60201,
                dorm_id: 602,
                room_id: null,
                maintenance_request_id: null,
                image_url: "images/usj5.jpg",
                uploaded_at: ""
            }
        ],

        dorm_type: "Private Nearby",
        gender: "Male / Female",
        distance: "3 minutes from USJ",
        availability_status: "Available",

        main_room_type: "Single Room",
        base_price: 450,

        rooms: [
            {
                room_id: 6021,
                dorm_id: 602,
                room_number: "M101",
                room_type: "Single Room",
                room_capacity: 1,
                current_occupancy: 0,
                occupancy_limit: 1,
                room_price: 450,
                availability_status: "Available",
                facilities: []
            },
            {
                room_id: 6022,
                dorm_id: 602,
                room_number: "M102",
                room_type: "Double Room",
                room_capacity: 2,
                current_occupancy: 0,
                occupancy_limit: 2,
                room_price: 320,
                availability_status: "Available",
                facilities: []
            }
        ],

        facilities: ["Wi-Fi", "Air Conditioning", "Study Area", "Laundry"]
    }
];


export const housingsData = dormsData;