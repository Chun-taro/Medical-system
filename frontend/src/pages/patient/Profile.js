import PatientLayout from './PatientLayout';
import './Profile.css'; // Assuming you have the CSS from earlier

export default function Profile() {
  return (
    <PatientLayout>
      <h2>Medical Profile</h2>
      <p>Please fill out your medical record completely and truthfully.</p>

      <form className="medical-form">

        {/* I. PERSONAL INFORMATION */}
        <section>
          <h3>Personal Information</h3>
          <div className="form-group">
            <label>Last Name</label>
            <input name="lastName" />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input name="firstName" />
          </div>
          <div className="form-group">
            <label>Middle Name</label>
            <input name="middleName" />
          </div>
          <div className="form-group">
            <label>Sex</label>
            <select name="sex">
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Civil Status</label>
            <select name="civilStatus">
              <option value="">Select</option>
              <option>Single</option>
              <option>Married</option>
              <option>Widowed</option>
              <option>Child</option>
            </select>
          </div>
          <div className="form-group">
            <label>Birthday</label>
            <input type="date" name="birthday" />
          </div>
          <div className="form-group">
            <label>Home Address</label>
            <input name="homeAddress" />
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input name="contactNumber" />
          </div>
          <div className="form-group">
            <label>Living With</label>
            <select name="livingWith">
              <option value="">Select</option>
              <option>Parents/Family</option>
              <option>Guardian</option>
              <option>BukSU Dormitory</option>
              <option>Boarding House</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Father's Name</label>
            <input name="fatherName" />
          </div>
          <div className="form-group">
            <label>Mother's Name</label>
            <input name="motherName" />
          </div>
          <div className="form-group">
            <label>Emergency Contact Person</label>
            <input name="emergencyContact" />
          </div>
          <div className="form-group">
            <label>Relationship</label>
            <input name="emergencyRelation" />
          </div>
          <div className="form-group">
            <label>Emergency Contact Number</label>
            <input name="emergencyNumber" />
          </div>
          <div className="form-group">
            <label>Preferred Hospital</label>
            <input name="preferredHospital" />
          </div>
        </section>

        {/* II. PERSONAL-SOCIAL HISTORY */}
        <section>
          <h3>Personal-Social History</h3>
          <div className="form-group">
            <label>Do you smoke?</label>
            <select name="smoke">
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label>Do you drink alcoholic beverages?</label>
            <select name="drink">
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label>Medications taken regularly</label>
            <input name="medications" />
          </div>
          <div className="form-group">
            <label>Allergies</label>
            <input name="allergies" />
          </div>
          <div className="form-group">
            <label>Physical Disabilities</label>
            <input name="disabilities" />
          </div>
        </section>

        {/* III. PAST MEDICAL HISTORY */}
        <section>
          <h3>Past Medical History</h3>
          <div className="form-group">
            <label>Previous Illnesses</label>
            <textarea name="illnesses" placeholder="List any past illnesses..." />
          </div>
        </section>

        {/* IV. IMMUNIZATION HISTORY */}
        <section>
          <h3>Immunization History</h3>
          <div className="form-group">
            <label>Vaccines Received</label>
            <textarea name="vaccines" placeholder="List vaccines received..." />
          </div>
        </section>

        {/* V. FAMILY HISTORY */}
        <section>
          <h3>Family History</h3>
          <div className="form-group">
            <label>Family Illnesses</label>
            <textarea name="familyIllnesses" placeholder="List any family illnesses..." />
          </div>
        </section>

        {/* VI. DENTAL HISTORY */}
        <section>
          <h3>Dental History</h3>
          <div className="form-group">
            <label>Dental Problems</label>
            <input name="dentalIssues" />
          </div>
        </section>

        {/* VII. PHYSICAL EXAMINATION */}
        <section>
          <h3>Physical Examination (Clinic Use Only)</h3>
          <p><em>To be filled out by the University Clinic</em></p>
          <div className="form-group">
            <label>Height</label>
            <input name="height" />
          </div>
          <div className="form-group">
            <label>Weight</label>
            <input name="weight" />
          </div>
          <div className="form-group">
            <label>Blood Pressure</label>
            <input name="bp" />
          </div>
          {/* Add other fields as needed */}
        </section>

        <button type="submit">Submit Medical Record</button>
      </form>
    </PatientLayout>
  );
}