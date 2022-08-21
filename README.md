## Title: Cancer patient management (user version including patient, doctor, nurse, guest)

---

### Overview:

- Web application for medical facilities to manage cancer patients & their related information (including 3 records: appointment, general examination, treatment).
- Features:
      - Common features (for all users that has signed in with an account)
        - View profile
        - Change password
        - User Login / Logout (initialize project and access website http://localhost:3000)
        
    - Guest features (no sign in required)
        - Search by an indicator
        - Search a cancer
        - Search a treatment

    - Doctor features (sign in required)
        - Manage my appointments
        - Manage my general examinations
        - Manage my patients
            - Remove an user in my patient list
            - Check next appointment of a patient
        - Search patient
            - Add to my patient list
            - Manage patient appointment, general examination, treatment records
        - Search a cancer
    
    - Nurse features (sign in required)
        - The same with doctor but exclude manage my appointments and manage patient appointment
        
    - Patient features (sign in required)
        - View my appointment, general examination, treatment records
        - Search a cancer
        
- Techstacks:
    - React (ChakraUI, Vitejs)
    - Nodejs
    - Firestore database
    
- Provided patient account:
    - Username: huynhduckhai@yahoo.com
    - Password: 123456
    
- Provided doctor account:
    - Username: quydon@yahoo.com
    - Password: 8944667
    
- Provided nurse account:
    - Username: lecongtru@yahoo.com
    - Password: 123456
